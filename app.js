const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
 app.use(express.json());

// MongoDB Atlas Connection
const MONGODB_URI =  'mongodb+srv://sandeeprrk27:Ab12345@airbnb.vgwtbrw.mongodb.net/CRUD?retryWrites=true&w=majority&appName=airbnb';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB Atlas connection error:', err));

// Routes
const itemRoutes = require('./routes/items');
app.use('/api/items', itemRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 