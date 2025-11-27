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

// Helper: safely get file from req
function getUploadedFile(req, fields = ['file', 'image', 'imageFile', 'videoFile', 'upload']) {
  if (!req.files) return null;
  for (let f of fields) {
    if (req.files[f]) return req.files[f];
  }
  // fallback: first file present
  const first = Object.values(req.files)[0];
  return first || null;
}

async function uploadFileToCloudinary(file, folder) {
  const options = { folder, resource_type: "auto" };

  console.log("temp file path:", file && file.tempFilePath);

  if (file && file.tempFilePath) {
    return await cloudinary.uploader.upload(file.tempFilePath, options);
  }

  if (file && file.data) {
    const base64 = file.data.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64}`;
    return await cloudinary.uploader.upload(dataUri, options);
  }

  throw new Error('No file.tempFilePath or file.data available for upload');
}

// -------------------- LOCAL FILE UPLOAD --------------------
exports.localFileUpload = async (req, res) => {
  try {
    console.log("req.files:", req.files);

    const file = getUploadedFile(req);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
        availableFields: Object.keys(req.files || {})
      });
    }

    const uploadDir = path.join(__dirname, "file");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name || "");
    const filename = `${Date.now()}${ext}`;
    const destPath = path.join(uploadDir, filename);

    file.mv(destPath, (err) => {
      if (err) {
        console.error("File move error:", err);
        return res.status(500).json({
          success: false,
          message: "File move failed",
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "Local File Uploaded Successfully",
        file: { path: destPath, name: filename },
      });
    });
  } catch (error) {
    console.error("Local upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- IMAGE UPLOAD --------------------
exports.imageUpload = async (req, res) => {
  try {
    const { name, tags, email } = req.body;
    console.log("name, tags, email ->", name, tags, email);

    const file = getUploadedFile(req, ["imageFile", "image", "file"]);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
        availableFields: Object.keys(req.files || {})
      });
    }

    const supportedTypes = ["jpg", "jpeg", "png"];
    const ext = path.extname(file.name || "").toLowerCase();
    const fileType = ext ? ext.slice(1) : "";

    if (!isFileTypeSupported(fileType, supportedTypes)) {
      return res.status(400).json({
        success: false,
        message: "File format not supported. Supported: " + supportedTypes.join(", "),
      });
    }

    const response = await uploadFileToCloudinary(file, "CodeHelp");

    res.json({
      success: true,
      message: "Image Successfully Uploaded",
      data: {
        url: response.secure_url,
        public_id: response.public_id,
      },
    });
  } catch (error) {
    console.error("imageUpload error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// -------------------- VIDEO UPLOAD --------------------
exports.videoUpload = async (req, res) => {
  try {
    const { name, tags, email } = req.body;
    console.log(name, tags, email);

    const file = getUploadedFile(req, ["videoFile", "file"]);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided",
        availableFields: Object.keys(req.files || {})
      });
    }

    const supportedTypes = ["mp4", "mov"];
    const ext = path.extname(file.name || "").toLowerCase();
    const fileType = ext ? ext.slice(1) : "";

    if (!isFileTypeSupported(fileType, supportedTypes)) {
      return res.status(400).json({
        success: false,
        message: "File format not supported. Supported: " + supportedTypes.join(", "),
      });
    }

    const response = await uploadFileToCloudinary(file, "CodeHelp");

    await File.create({
      name,
      tags,
      email,
      imageUrl: response.secure_url,
      public_id: response.public_id,
    });

    res.json({
      success: true,
      message: "Video Successfully Uploaded",
      data: {
        url: response.secure_url,
        public_id: response.public_id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
