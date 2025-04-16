const mongoose = require('mongoose');
require('dotenv').config(); 

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/the-awaz";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Database is connected");
})
.catch((err) => {
    console.log("Database is not connected");
    console.log(err);
});
