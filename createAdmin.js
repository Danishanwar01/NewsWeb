// createAdmin.js
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/the-awaz';

mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log('Database is connected');
    try {
      const existing = await Admin.findOne({ name: 'new admin' });
      if (!existing) {
        await new Admin({ name: 'new admin', password: '987654321' }).save();
        console.log('Admin user created successfully');
      } else {
        console.log('Admin user already exists');
      }
    } catch (err) {
      console.error('Error creating admin:', err);
    } finally {
      process.exit(0);
    }
  })
  .catch(err => {
    console.error('Database is not connected:', err);
    process.exit(1);
  });
