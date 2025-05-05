import express from "express";

import { query, uploadFile, downloadFile } from "../controllers/userActions.controller.js";
import { upload } from "../middlewares/fileupload.middleware.js";
const router = express.Router();

router.post("/query", query);
router.post("/uploadFile", upload.single('file'), uploadFile);
router.get("/downloadFile", upload.single('file'), downloadFile);


export default router;