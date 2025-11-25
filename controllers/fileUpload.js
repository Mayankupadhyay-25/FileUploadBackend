const File = require("../models/File");
const fs = require('fs');
const path = require('path');
const cloudinary = require("cloudinary").v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: check supported file types
function isFileTypeSupported(fileType, supportedTypes = []) {
  if (!fileType) return false;
  return supportedTypes.includes(fileType.toLowerCase());
}

async function uploadFileToCloudinary(file, folder) {
  const options = { folder };

  console.log("temp file path:", file && file.tempFilePath);

  // prefer tempFilePath (express-fileupload with useTempFiles: true)
  if (file && file.tempFilePath) {
    return await cloudinary.uploader.upload(file.tempFilePath, options);
  }

  // fallback: upload from buffer (if useTempFiles: false)
  if (file && file.data) {
    const base64 = file.data.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64}`;
    return await cloudinary.uploader.upload(dataUri, options);
  }

  throw new Error('No file.tempFilePath or file.data available for upload');
}

// localFileUpload -> handler function
exports.localFileUpload = async (req, res) => {
  try {
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Try common field names: file, image, upload or take first file
    const file = req.files.file || req.files.image || req.files.upload || Object.values(req.files)[0];

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file field found',
        availableFields: Object.keys(req.files)
      });
    }
    console.log('Received file:', file.name || file);

    // upload directory (folder next to this controller named 'file')
    const uploadDir = path.join(__dirname, 'file');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created upload directory:', uploadDir);
    }

    // Create filename with proper extension (no extra spaces)
    const ext = path.extname(file.name) || '';
    const filename = `${Date.now()}${ext}`;
    const destPath = path.join(uploadDir, filename);
    console.log('DEST PATH->', destPath);

    file.mv(destPath, (err) => {
      if (err) {
        console.error('File move error:', err);
        return res.status(500).json({ success: false, message: 'File move failed', error: err.message });
      }

      return res.json({
        success: true,
        message: 'Local File Uploaded Successfully',
        file: { path: destPath, name: filename }
      });
    });
  } catch (error) {
    console.error('Not able to upload the file on server', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// image upload handler
exports.imageUpload = async (req, res) => {
  try {
    // data fetch
    const { name, tags, email } = req.body;
    console.log('name, tags, email ->', name, tags, email);

    const file = req.files && (req.files.imageFile || req.files.file || Object.values(req.files)[0]);
    if (!file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    console.log('file object ->', file);

    // validation: supported types
    const supportedTypes = ["jpg", "jpeg", "png"];

    // safer filetype extraction using path.extname
    const ext = path.extname(file.name || '').toLowerCase(); // e.g. '.jpg'
    const fileType = ext ? ext.slice(1) : ''; // remove the dot

    if (!isFileTypeSupported(fileType, supportedTypes)) {
      return res.status(400).json({
        success: false,
        message: 'File format not supported. Supported: ' + supportedTypes.join(', ')
      });
    }

    // upload to cloudinary (folder CodeHelp)
    const response = await uploadFileToCloudinary(file, "CodeHelp");
    console.log('Cloudinary response ->', response);

    // Optionally save to DB. Example:
    // const fileData = await File.create({
    //   name,
    //   tags,
    //   email,
    //   imageUrl: response.secure_url,
    //   public_id: response.public_id,
    // });

    res.json({
      success: true,
      message: 'Image Successfully Uploaded',
      data: {
        url: response.secure_url,
        public_id: response.public_id,
      }
    });

  } catch (error) {
    console.error('imageUpload error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Upload failed'
    });
  }
};
