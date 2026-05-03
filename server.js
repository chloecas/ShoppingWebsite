const express = require("express");
const path = require("path");
const client = require("./db");
const app = express();
const redis = require("./redis");

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/api/products", async (req,res) => {
	try{
		const cached = await redis.get("products");

		if(cached){
			return res.json(JSON.parse(cached));
		}
	
	const result = await client.query("SELECT * FROM Products");

	const formatted = result.rows.map(p => ({
		productId: p.productid,
		productName: p.productname,
		productPrice: p.productprice,
		productImage: p.productimage
	}));

		await redis.setEx("products", 60, JSON.stringify(formatted));
	
		res.json(formatted);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch products" });
	}
});

app.post("/api/users", async (req, res) => {
	try {
		const { user, fname, lname, email, address, phone, passwd } = req.body;

		await client.query(
			`INSERT INTO Users(username, userFirst, userLast, userEmail, userAddress, userPhone, userPassword)
			VALUES($1, $2, $3, $4, $5, $6, $7)`,
			[user, fname, lname, email, address, phone, passwd]
		);

		res.json({ 
			success: true,
			user: result.rows[0]
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to create user" });
	}
});


app.post("/api/cart", async (req, res) => {
    const userId = req.user.id; // or session id
    const cart = req.body.cart;

    await redisClient.set(
        `cart:${userId}`,
        JSON.stringify(cart)
    );

    res.json({ success: true });
});

app.get("/api/cart", async (req, res) => {
    const userId = req.user.id;

    const cart = await redisClient.get(`cart:${userId}`);

    res.json({
        cart: cart ? JSON.parse(cart) : []
    });
});

app.post("/api/checkout", async (req, res) => {
	const {cart, userId } = req.body;

	if(!cart || cart.length === 0) {
		return res.status(400).json({error: "Cart is empty"});
	}

	const clientConn = await client.connect();

	try {
		await clientConn.query("BEGIN");

		const orderResult = await clientConn.query(
			`INSERT INTO Orders(userId, orderTotal)
			VALUES($1, 0)
			RETURNING orderId`,
			[userId || null]
		);

		const orderId = orderResult.rows[0].orderid;
		let total = 0;

		for(const item of cart){
			const { productId, sizeId, quantity } = item;

			const result = await clientConn.query(
				`SELECT p.productprice, ps.productstock
				FROM Product p
				JOIN ProductSizes ps ON p.productid = ps.productid
				WHERE p.productid = $1 AND ps.sizeid = $2`,
				[productId, sizeId]
			);

			if(result.rows.length === 0){
				throw new Error("Product or size not found");
			}

			const price = result.rows[0].productprice;
			const stock = result.rows[0].productstock;

			if(stock < quantity){
				throw new Error(`Not enoguh stock for product ${productId}`);
			}

			await clientConn.query(
				`UPDATE ProductSizes
				SET productStock = productStock - $1
				WHERE productid = $2 AND sizeId = $3`,
				[quantity, productId, sizeId]
			);

			total += price * quantity;
		}

		await clientConn.query(
			`UPDATE Orders SET orderTotal = $1 WHERE orderId = $2`,
			[total, orderId]
		);

		await clientConn.query("COMMIT");

		res.json({
			success: true,
			orderId,
			total
		});
		
		} catch (err) {
			await clientConn.query("ROLLBACK");
			console.error(err);
			res.status(500).json({ error: err.message });
		} finally {
			clientConn.release();
		}
	});

app.get("/account", (req, res) => {
	res.sendFile(path.join(__dirname, "views", "account.html"));
});

app.get("/checkout", (req, res) => {
	res.sendFile(path.join(__dirname, "views", "checkout.html"));
});


app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
