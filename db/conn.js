// conn.js
const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/the-awaz';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Database is connected');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
