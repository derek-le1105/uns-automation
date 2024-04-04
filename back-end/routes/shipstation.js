const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

require("dotenv").config();

router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");
    console.log(req.file);
    return res.status(200).json("Verified Input");
  } catch (error) {}
});

module.exports = router;
