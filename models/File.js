const mongoose = require("mongoose")
const nodemailer = require("nodemailer");

const fileSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    imageUrl:{
        type:String,
    },
    tags:{
        type:String,
    },
    email:{
        type:String,
    }
});  

//post middleware
fileSchema.post("save", async function (doc){
    try{
        console.log("DOC",doc)

        //transporter
        let transporter = nodemailer.transporter({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            },
        })

        //send mail 
        let info =await transporter.sendMail({
            from: `codeHelp - by Mayank`,
            to: doc.email,
            subject: "new File Uploaded on cloudinary",
            html:`<Hello jee/h2> <p> File Uploded </p>,`,
            
        })
        console.log("INFO",info);

    }
    catch{
        console.error(error);

    }
})


const File = mongoose.model("File",fileSchema);
module.exports = File;