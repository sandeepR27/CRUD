const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email or username already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: 'user' // Default role
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data (excluding password)
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.status(201).json({
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ message: 'Error registering user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data (excluding password)
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.json({
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ message: 'Error logging in' });
    }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(400).json({ message: 'Error fetching user data' });
    }
});

// Logout user (client-side token removal)
router.post('/logout', authenticate, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router; 