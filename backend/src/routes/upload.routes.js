import express from "express";
const router = express.Router();
import {imagekit} from "../config/imagekit.js";

router.post("/upload", async (req, res) => {
  try {
    const { file, fileName } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({
        success: false,
        message: "File and fileName are required",
      });
    }

    const response = await imagekit.upload({
      file, // base64 string
      fileName,
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