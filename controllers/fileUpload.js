const File = require("../models/File")

// localFileUpload -> handler function
exports.localFileUpload = async (req, res) => {
    try{

        //fetch file
        const file = req.files.file;
        console.log("FILE AA GYI JEE" ,file);

        let path = __dirname + "/file/" + Date.now();
        console.log("PATH->",path)

        file.mv(path, (err)=>{
            if (err) {
                console.error('File move error:', err);
                return res.status(500).json({ success: false, message: 'File move failed' });
            }
        });

        res.json({
            success:true,
            message:"Local File Uploded Successfully",
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });

    }
}
