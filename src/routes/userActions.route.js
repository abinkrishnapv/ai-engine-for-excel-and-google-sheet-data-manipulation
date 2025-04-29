import express from "express";

import { query, uploadFile } from "../controllers/userActions.controller.js";
import { upload } from "../middlewares/fileupload.middleware.js";
const router = express.Router();

router.post("/query", query);
router.post("/uploadFile", upload.single('file'), uploadFile);

export default router;