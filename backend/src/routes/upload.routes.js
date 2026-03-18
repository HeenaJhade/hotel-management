import express from "express";
import multer from "multer";
import { imagekit } from "../config/imagekit.js";

const router = express.Router();

// ✅ store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // ✅ multer gives file here
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    // ✅ convert buffer to base64 for ImageKit
    const base64File = file.buffer.toString("base64");

    const response = await imagekit.upload({
      file: base64File,
      fileName: file.originalname,
      folder: "hotel-management",
    });

    res.json({
      success: true,
      url: response.url,
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
});

export default router;