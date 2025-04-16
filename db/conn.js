const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/the-awaz", {

    useNewUrlParser: true,

    useUnifiedTopology: true

}).then(() => {

    console.log("database is connected")

}).catch((err) => {

    console.log("database is not connected");

    console.log(err);

})
