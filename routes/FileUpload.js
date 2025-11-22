const express = require("express");
const router = express.Router();

const { localFileUpload } = require("../controllers/fileUpload");

//api route
//api route
router.post("/localFileUpload", localFileUpload);
// alias for clients using the misspelled path


module.exports = router;
