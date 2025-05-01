import { getExcelMetadata, getExcelDataArray } from "../lib/excel.js";
import File from "../models/file.model.js";
import { processQuery, createEmbeddings, addToChromaDB } from "../lib/llm.js";

export const query = async (req, res) => {
    try {
        // console.log(req.session.uploadedFiles)
        if (!req.session.uploadedFiles || req.session.uploadedFiles === 0) {
            return res.status(200).json({ message: "No dataset available. Please upload a  dataset first" });
        }

        let data = await processQuery(req.body.input, req.session, req.session.uploadedFiles[0].type)
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error in query function", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        if (!req.session.uploadedFiles) {
            req.session.uploadedFiles = [];
        }

        if (req.body.type === "unstructured") {
            var excelData = await getExcelDataArray(req.file.filename);
            console.log(excelData);
            const chunkSize = 10;
            for (let i = 0; i < excelData.length; i += chunkSize) {
                const chunk = excelData.slice(i, i + chunkSize)
                var embeddings = await createEmbeddings(chunk);
                await addToChromaDB(embeddings, chunk, req.session.id)
            }
            req.session.uploadedFiles[0] = { fileID: "", type: "unstructured" }

        }
        else {
            var metadata = await getExcelMetadata(req.file);


            var file = new File({ filename: req.file.filename, originalname: req.file.originalname, metadata });
            await file.save();

            console.log(metadata);

            if (req.session.uploadedFiles.length < 2) {
                req.session.uploadedFiles.push({ fileID: file._id, type: "structured" });
            } else {
                req.session.uploadedFiles[1] = { fileID: file._id, type: "structured" };
            }

        }

        return res.status(200).json({ message: "File Uploaded" });


    } catch (error) {
        console.error("Error in uploadFile function", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
