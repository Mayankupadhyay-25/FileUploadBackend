const express = require("express");
const router = express.Router();

const { localFileUpload } = require("../controllers/fileUpload");

// api routes
router.post("/localFileUpload", localFileUpload);
router.post("/imageUpload", localFileUpload);

module.exports = router;
