CREATE TABLE Users (
    userId SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    userFirst TEXT NOT NULL,
    userLast TEXT NOT NULL,
    userEmail TEXT NOT NULL,
    userAddress TEXT,
    userPhone TEXT,
    userPassword TEXT NOT NULL
);

CREATE TABLE Orders (
    orderId SERIAL PRIMARY KEY,
    userId INT REFERENCES Users(userId),
    orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    orderTotal NUMERIC(10,2),

    CHECK (orderTotal >= 0)
);

CREATE TABLE Products (
    productId SERIAL PRIMARY KEY,
    productName TEXT NOT NULL,
    productPrice NUMERIC(10,2),
    productImage TEXT
);

CREATE TABLE ProductSizes (
    sizeId SERIAL PRIMARY KEY,
    productId INT REFERENCES Products(productId),
    productSize TEXT,
    productStock INT CHECK (productStock >=0)
);

INSERT INTO Users (username, userFirst, userLast, userEmail, userAddress, userPhone, userPassword)
VALUES ('chloecas', 'Chloe', 'Castrataro', 'ccas@gmail.com', '123 Vanier St', '514-555-8989', 'Vanier987'),
('neozid', 'Neo', 'Zidereck', 'neo@hotmail.com', '455 ave Decarie', '438-999-1234', 'CompSci123'),
('annaJ', 'Anna', 'Jones', 'j_anna@outlook.com', '90 ave St Croix', '514-333-9876', '345Unix');

INSERT INTO Orders (userId, orderDate, orderTotal)
VALUES (1, NOW(), 75.95),
(2, '2026-03-24 10:30:00', 150.00),
(3, '2026-04-09 11:00:00', 55.75);

INSERT INTO Products (productName, productPrice, productImage)
VALUES ('Black T Shirt', 15.00, '/images/blackShirt.jpg'),
('Red T Shirt', 25.00, '/images/redShirt.jpg'),
('Blue T Shirt', 20.00, '/images/blueShirt.jpg');

INSERT INTO ProductSizes (productId, productSize, productStock)
VALUES (1, 'Small', 5),
(1, 'Medium', 9),
(1, 'Large', 10),
(2, 'Small', 7),
(2, 'Medium', 15),
(2, 'Large', 3),
(3, 'Small', 8),
(3, 'Medium', 11),
(3, 'Large', 15);

