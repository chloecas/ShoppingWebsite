const express = require("express");
const path = require("path");
const client = require("./db");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/api/products", async (req,res) => {
	const result = await client.query("SELECT * FROM Products");

	const formatted = result.rows.map(p => ({
		productId: p.productid,
		productName: p.productname,
		productPrice: p.productprice,
		productImage: p.productimage
	}));
	
	res.json(formatted);
});

app.post("/api/users", async (req, res) => {
	try {
		const { user, fname, lname, email, address, phone, passwd } = req.body;

		await client.query(
			`INSERT INTO Users(username, userFirst, userLast, userEmail, userAddress, userPhone, userPassword)
			VALUES($1, $2, $3, $4, $5, $6, $7)`,
			[username, userFirst, userLast, userEmail, userAddress, userPhone, userPassword]
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

app.get("/account", (req, res) => {
	res.sendFile(path.join(__dirname, "views", "account.html"));
});

app.get("/checkout", (req, res) => {
	res.sendFile(path.join(__dirname, "views", "checkout.html"));
});


app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
