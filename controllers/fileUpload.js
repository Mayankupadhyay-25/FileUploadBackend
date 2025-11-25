const File = require("../models/File");
const fs = require('fs');
const path = require('path');
const cloudinary = require("cloudinary").v2;

// localFileUpload -> handler function
exports.localFileUpload = async (req, res) => {
    try {
        console.log('req.files:', req.files);
        console.log('req.body:', req.body);

        if (!req.files) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        // Try common field names: file, image, upload
        const file = req.files.file || req.files.image || req.files.upload || Object.values(req.files)[0];

        if (!file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file field found',
                availableFields: Object.keys(req.files)
            });
        }
        console.log('Received file:', file.name || file);

        // corrrent working directory 
        const uploadDir = path.join(__dirname, 'file');

        // create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('Created upload directory:', uploadDir);
        }

        const filename = `${Date.now()} ${path.extname(file.name) || ''}`;
        const destPath = path.join(uploadDir, filename);
        console.log('DEST PATH->', destPath);

        file.mv(destPath, (err) => {
            if (err) {
                console.error('File move error:', err);
                return res.status(500).json({ success: false, message: 'File move failed' });
            }

            return res.json({
                success: true,
                message: 'Local File Uploaded Successfully',
                file: { path: destPath, name: filename }
            });
        });
    } catch (error) {
        console.error('Not able to upload the file on server', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
    
}
async function uploadFileToCloudinary(file, folder){
    const options = {folder};
    console.log("tempt file path", file.tempFilePath);
    return await cloudinary.uploader.upload(file.tempFilePath, option)
}

//image uplode ka hadnler
exports.imageUpload = async (req , res) =>{
    try{
        //data fetch 
        const { name, tags, email} = req.body;
        console.log(name,tags,email);

        const file = req.files.imageFile;
        console.log(file);

        //validetion 
        const supportedType = ["jpg", "jpeg", "png"];
        const fileType = file.name.split('.')[1].toLowerCase();

        if(!isFileTypeSupported(fileType, supportedTypes)){
            return res.status(400).json({
                success:false,
                message:'file formet not supported',
            })
        }

        //file formet supported hai
        const responce = await uploadFileToCloudinary(file,"CodeHelp");
        console.log(responce);

        //db me entry save krni hai
        // const fileData = await file.creat({
        //     name,
        //     tags,
        //     email,
        //     imageUrl
        // })

        res.json({
            success:true,
            message:'Image Successfully Uploaded'
        })

    }
    catch(error){
        console.error(error);
        res.status(400).json({
            success:false,
            message:'someting went wrong'
        })

    }
}
