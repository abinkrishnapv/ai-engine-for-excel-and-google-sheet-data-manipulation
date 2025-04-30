import { getExcelMetadata } from "../lib/excel.js";
import File from "../models/file.model.js";
import QueryResult from "../models/queryResult.model.js";
import { processQuery } from "../lib/llm.js";

export const query = async (req, res) => {
    try {
        console.log(req.session.uploadedFiles)

        if (!req.session.uploadedFiles || req.session.uploadedFiles === 0) {
            return res.status(200).json({ message: "No dataset available. Please upload a  dataset first" });
        }

        let data = await processQuery(req.body.input,req.session)


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

        // console.log(req.session)
        if (!req.session.uploadedFiles) {
            req.session.uploadedFiles = [];
        }


        var metadata = await getExcelMetadata(req.file);


        const file = new File({ filename: req.file.filename, originalname: req.file.originalname, metadata });
        await file.save();

        console.log('id:', file._id);

        console.log(metadata);

        req.session.uploadedFiles.push({ fileID: file._id })

        console.log(req.session)




        return res.status(200).json({ fileName: file.filename });
    } catch (error) {
        console.error("Error in query function", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
