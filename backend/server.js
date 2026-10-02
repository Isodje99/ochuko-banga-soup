const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
const transporter = require("nodemailer").createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// =============================
// AUTHENTICATION MIDDLEWARE
// =============================

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


// =============================
// ADMIN AUTHENTICATION
// =============================

function requireAdmin(req, res, next) {

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required."
        });
    }

    next();
}


// =============================
// START SERVER
// =============================

async function startServer() {

    try {

        await client.connect();

        console.log("Connected to MongoDB successfully!");

        const database = client.db("ochuko-banga-soup");

        const orders = database.collection("orders");
        const users = database.collection("users");


        // =============================
        // HOME ROUTE
        // =============================

        app.get("/", (req, res) => {
            res.send("Welcome to Ochuko Banga Soup!");
        });


        // =============================
        // REGISTER CUSTOMER
        // =============================

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

                const hashedPassword = await bcrypt.hash(
                    password,
                    10
                );

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

                console.error(
                    "Registration error:",
                    error
                );

                res.status(500).json({
                    message: "Could not create account."
                });

            }

        });


        // =============================
        // LOGIN
        // CUSTOMER + ADMIN
        // =============================

        app.post("/api/login", async (req, res) => {

            try {

                const { email, password } = req.body;


                // ADMIN LOGIN
                if (
                    email === process.env.ADMIN_EMAIL &&
                    password === process.env.ADMIN_PASSWORD
                ) {

                    const token = jwt.sign(
                        {
                            email: email,
                            role: "admin"
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: "7d"
                        }
                    );

                    return res.json({
                        message: "Admin login successful!",
                        token: token,
                        name: "Admin",
                        role: "admin"
                    });

                }


                // CUSTOMER LOGIN

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
                        email: user.email,
                        role: "customer"
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "7d"
                    }
                );


                res.json({
                    message: "Login successful!",
                    token: token,
                    name: user.name,
                    role: "customer"
                });


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                res.status(500).json({
                    message: "Could not login."
                });

            }

        });

// =============================
// FORGOT PASSWORD
// =============================

app.post("/api/forgot-password", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Please enter your email address."
            });
        }

        const user = await users.findOne({
            email: email.toLowerCase().trim()
        });

        // Don't reveal whether an email exists
        if (!user) {
            return res.json({
                message: "If an account exists with that email, a reset link has been sent."
            });
        }

        // Create a secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store only the hashed version in MongoDB
        const hashedResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Token expires in 30 minutes
        const resetTokenExpires = new Date(
            Date.now() + 30 * 60 * 1000
        );

        await users.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: hashedResetToken,
                    resetPasswordExpires: resetTokenExpires
                }
            }
        );

        const resetLink =
            `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;

        await transporter.sendMail({
            from: `"Ochuko Banga Soup" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Reset Your Ochuko Banga Soup Password",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">

                    <h2 style="color: #8b0000;">
                        Ochuko Banga Soup
                    </h2>

                    <p>Hello ${user.name},</p>

                    <p>
                        We received a request to reset your password.
                    </p>

                    <p>
                        Click the button below to create a new password.
                    </p>

                    <a href="${resetLink}"
                       style="
                       display:inline-block;
                       padding:14px 24px;
                       background:#8b0000;
                       color:white;
                       text-decoration:none;
                       border-radius:6px;
                       font-weight:bold;
                       ">
                        Reset Password
                    </a>

                    <p style="margin-top:25px;">
                        This link will expire in 30 minutes.
                    </p>

                    <p>
                        If you did not request a password reset,
                        you can safely ignore this email.
                    </p>

                    <p>
                        — Ochuko Banga Soup
                    </p>

                </div>
            `
        });

        res.json({
            message: "If an account exists with that email, a reset link has been sent."
        });

    } catch (error) {

        console.error("Forgot password error:", error);

        res.status(500).json({
            message: "Could not process password reset request."
        });

    }

});

// =============================
// RESET PASSWORD
// =============================

app.post("/api/reset-password", async (req, res) => {

    try {

        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                message: "Please provide the reset token and new password."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        // Hash the token from the link
        const hashedResetToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with valid, non-expired token
        const user = await users.findOne({
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "This password reset link is invalid or has expired."
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        // Update password and remove reset token
        await users.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword
                },
                $unset: {
                    resetPasswordToken: "",
                    resetPasswordExpires: ""
                }
            }
        );

        res.json({
            message: "Password reset successfully. You can now login."
        });

    } catch (error) {

        console.error("Reset password error:", error);

        res.status(500).json({
            message: "Could not reset password."
        });

    }

});

        // =============================
        // CREATE ORDER
        // =============================

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


                    console.log(
                        "New order saved to MongoDB:"
                    );

                    console.log(order);


                    res.status(201).json({

                        message:
                            "Order received and saved successfully",

                        orderId:
                            result.insertedId

                    });


                } catch (error) {

                    console.error(
                        "Error saving order:",
                        error
                    );

                    res.status(500).json({
                        message:
                            "Could not save order"
                    });

                }

            }
        );


        // =============================
        // ADMIN TEST ROUTE
        // =============================

        app.get(
            "/api/admin/test",
            authenticateToken,
            requireAdmin,
            (req, res) => {

                res.json({
                    message:
                        "Admin authentication is working!"
                });

            }
        );
// =============================
// ADMIN - VIEW CUSTOMERS
// =============================

app.get(
    "/api/admin/users",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const customers = await users
                .find({})
                .project({
                    password: 0
                })
                .sort({
                    createdAt: -1
                })
                .toArray();

            res.json(customers);

        } catch (error) {

            console.error(
                "Error getting customers:",
                error
            );

            res.status(500).json({
                message: "Could not load customers."
            });

        }

    }
);


// =============================
// ADMIN - VIEW ORDERS
// =============================

app.get(
    "/api/admin/orders",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const customerOrders = await orders
                .find({})
                .sort({
                    createdAt: -1
                })
                .toArray();

            res.json(customerOrders);

        } catch (error) {

            console.error(
                "Error getting orders:",
                error
            );

            res.status(500).json({
                message: "Could not load orders."
            });

        }

    }
);

        // =============================
        // START LISTENING
        // =============================

        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    `Ochuko Banga Soup server is running on port ${PORT}`
                );

            }
        );


    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error
        );

    }

}


// =============================
// RUN SERVER
// =============================

startServer();