const mongoose = require("mongoose");

exports.connect =() => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })

    .then(console.log("DB is connection successfuly"))
    .catch( (error) => {
        console.log("DB connection issue");
        console.error(error);
        process.exit(1);
        
    });
};