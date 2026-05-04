const express = require("express");
const path = require("path");
const pool = require("./db");
const session = require("express-session");
const app = express();
const redis = require("./redis");

app.use(express.json());
app.use(express.static("public"));

app.use(session({
    secret: "shopping-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/api/products", async (req,res) => {
	try{
		const cached = await redis.get("products");

		if(cached){
			return res.json(JSON.parse(cached));
		}
	
	const result = await pool.query("SELECT * FROM Products");

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

		const result = await pool.query(
    		`INSERT INTO Users(username, userFirst, userLast, userEmail, userAddress, userPhone, userPassword)
   			 VALUES($1, $2, $3, $4, $5, $6, $7)
    		RETURNING *`,
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
    try {
        if (!req.session?.userId) {
            return res.status(401).json({ error: "Please log in to use the cart" });
        }

        const userId = req.session.userId;
        const cart = req.body.cart;

        await redis.set(`cart:${userId}`, JSON.stringify(cart));
        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save cart" });
    }
});

app.get("/api/cart", async (req, res) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({ error: "Please log in to use the cart" });
        }

        const userId = req.session.userId;
        const cart = await redis.get(`cart:${userId}`);

        res.json({
            cart: cart ? JSON.parse(cart) : []
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get cart" });
    }
});

app.post("/api/checkout", async (req, res) => {
	const { cart } = req.body;
	const userId = req.session?.userId || null; 

	if(!cart || cart.length === 0) {
		return res.status(400).json({error: "Cart is empty"});
	}

	const clientConn = await pool.connect();

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
				FROM Products p
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


app.post("/api/login", async (req, res) => {
    try {
        const { email, passwd } = req.body;
        const result = await pool.query(
            `SELECT * FROM Users WHERE userEmail = $1 AND userPassword = $2`,
            [email, passwd]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];
		req.session.userId= user.userid;
		req.session.username = user.username;
        res.json({ success: true, username: user.username });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
});


app.get("/api/orders", async (req, res) => {
    const userId = req.session?.userId;

    if (!userId) {
        return res.status(401).json({ error: "Please log in to view orders" });
    }

    try {
        const result = await pool.query(
            `SELECT orderId, orderTotal, orderDate 
             FROM Orders 
             WHERE userId = $1 
             ORDER BY orderDate DESC`, 
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

app.get("/api/sizes", async (req, res) => {
    try {
        const { productId, size } = req.query;
        const result = await pool.query(
            `SELECT sizeId FROM ProductSizes WHERE productId = $1 AND productSize = $2`,
            [productId, size]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Size not found" });
        }

        res.json({ sizeId: result.rows[0].sizeid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch size" });
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
