// createAdmin.js
const mongoose = require('mongoose');
const Admin = require('./models/Admin');  

mongoose.connect("mongodb://127.0.0.1:27017/the-awaz", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log("database is connected");
  try {
    const admin = new Admin({ name: "new admin", password: "987654321" });
    await admin.save();
    console.log("Admin user created successfully");
  } catch (err) {
    console.error("Error creating admin:", err);
  } finally {
    process.exit(0);
  }
})
.catch((err) => {
  console.log("database is not connected");
  console.error(err);
});
