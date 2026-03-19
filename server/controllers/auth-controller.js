require("dotenv").config();

const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, name, role });
        await user.save();

        console.log("User registered successfully");
        return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.log("Error registering user", err.message);
        return res.status(500).json({ message: "Error registering user", error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: "1h" });
        return res.status(200).json({ token, message: "Logged in successfully" });
    } catch (err) {
        console.log("Error logging in", err.message);
        return res.status(500).json({ message: "Error logging in", error: err.message });
    }
};
