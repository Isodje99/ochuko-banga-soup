const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Please login first."
        });
    }

    try {
        const user = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = user;

        next();

    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired login."
        });
    }
}
async function startServer() {
    try {
        await client.connect();

        console.log("Connected to MongoDB successfully!");

        const database = client.db("ochuko-banga-soup");
        const orders = database.collection("orders");
        const users = database.collection("users");

        app.get("/", (req, res) => {
            res.send("Welcome to Ochuko Banga Soup!");
        });

      app.post(
    "/api/orders",
    authenticateToken,
    async (req, res) => {
            try {
               const order = {
    ...req.body,
    userId: req.user.userId
};

                const result = await orders.insertOne({
                    ...order,
                    status: "Pending",
                    createdAt: new Date()
                });

                console.log("New order saved to MongoDB:");
                console.log(order);

                res.status(201).json({
                    message: "Order received and saved successfully",
                    orderId: result.insertedId
                });

            } catch (error) {
                console.error("Error saving order:", error);

                res.status(500).json({
                    message: "Could not save order"
                });
            }
        });
        app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        const existingUser = await users.findOne({
            email: email
        });

        if (existingUser) {
            return res.status(400).json({
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            name: name,
            email: email,
            password: hashedPassword,
            createdAt: new Date()
        };

        await users.insertOne(newUser);

        res.status(201).json({
            message: "Account created successfully!"
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Could not create account."
        });
    }
});
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await users.findOne({
            email: email
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

       res.json({
    message: "Login successful!",
    token: token,
    name: user.name
});

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Could not login."
        });
    }
});
        app.listen(PORT, "0.0.0.0", () => {
            console.log(
                `Ochuko Banga Soup server is running on port ${PORT}`
            );
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}

startServer();