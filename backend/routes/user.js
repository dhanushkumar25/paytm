const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const zod = require("zod");
const { User, Account } = require("../db");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const router = express.Router();

//Schema for user signup
const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string().min(1),
    lastName: zod.string().min(1),
    password: zod.string().min(6)
});

// 🔹 User Signup Route
router.post("/signup", async (req, res) => {
    try {
        const parsedData = signupBody.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        const { username, firstName, lastName, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Email already taken" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            password: hashedPassword,
            firstName,
            lastName
        });

        // Assign a random balance between 1000 - 9999
        await Account.create({
            userId: user._id,
            balance: Math.floor(1000 + Math.random() * 9000)
        });

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "User created successfully", token });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// 📌 Schema for user signin
const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string().min(6)
});

// 🔹 User Signin Route
router.post("/signin", async (req, res) => {
    try {
        const parsedData = signinBody.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// 📌 Schema for updating user details
const updateBody = zod.object({
    password: zod.string().min(6).optional(),
    firstName: zod.string().min(1).optional(),
    lastName: zod.string().min(1).optional()
});

// 🔹 Update User Details Route
router.put("/", authMiddleware, async (req, res) => {
    try {
        const parsedData = updateBody.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({ message: "Invalid update data" });
        }

        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        await User.updateOne({ _id: req.userId }, { $set: req.body });

        res.json({ message: "Updated successfully" });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// 🔹 Get All Users with Balances Route
router.get("/bulk", async (req, res) => {
    try {
        const filter = req.query.filter || "";

        // Find users based on filter
        const users = await User.find({
            $or: [
                { firstName: { $regex: filter, $options: "i" } },
                { lastName: { $regex: filter, $options: "i" } }
            ]
        }).lean();

        if (!users.length) {
            return res.status(404).json({ message: "No users found" });
        }

        // Get user IDs
        const userIds = users.map(user => user._id);

        // Fetch balances for all users
        const accounts = await Account.find({ userId: { $in: userIds } }).lean();

        // Create a map of userId -> balance
        const accountMap = new Map(accounts.map(acc => [acc.userId.toString(), acc.balance]));

        // Attach balances to user data
        const usersWithBalance = users.map(user => ({
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            balance: accountMap.get(user._id.toString()) || 0  // Default to 0 if balance not found
        }));

        res.json({ users: usersWithBalance });

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
