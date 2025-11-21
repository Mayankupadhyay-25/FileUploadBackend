 //app create 
const express = require("express");
const app = express();

 //PORT find krna h
 require("dotenv").config();
 const PORT = process.env.PORT || 3000;

 //middleware add krne hai 
 app.use(express.json());
const fileUpload = require("express-fileupload");
app.use(fileUpload());

 //db connect kena 
 const db = require('./config/database');
 db.connect();
 
 //cloud connect kena 
const cloudinary = require("./config/cloudinary")
cloudinary.cloudinaryconnect();

//api route mount krna hai
const Upload = require("./routes/FileUpload");
app.use("/api/v1", Upload);

 //activate server
 app.listen(PORT,() => {
    console.log(`App is running at ${PORT}`);
 })

