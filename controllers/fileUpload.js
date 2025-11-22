const File = require("../models/File");
const fs = require('fs');
const path = require('path');

// localFileUpload -> handler function
exports.localFileUpload = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
 
        const file = req.files.file;
        console.log('Received file:', file.name || file);

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
};
