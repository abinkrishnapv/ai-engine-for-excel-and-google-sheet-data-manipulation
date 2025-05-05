import { getExcelMetadata, getExcelDataArray, getTableSchema, createDuckDBTableFromSheet } from "../lib/excel.js";
import File from "../models/file.model.js";
import { processQuery, createEmbeddings, addToChromaDB } from "../lib/llm.js";
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { connection } from "../lib/duckdb.js";

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

            var c = await createDuckDBTableFromSheet(`uploads/${req.file.filename}`)
            var metadata = await getTableSchema(c.tableName)


            // var metadata = await getExcelMetadata(req.file);


            var file = new File({ filename: req.file.filename, originalname: req.file.originalname, metadata });
            await file.save();

            console.log(metadata);

            if (req.session.uploadedFiles.length < 2) {
                req.session.uploadedFiles.push({ fileID: file._id, type: "structured", filename: req.file.filename });
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

export const downloadFile = async (req, res) => {

    if (!req.session.uploadedFiles || req.session.uploadedFiles === 0) {
        return res.status(200).json({ message: "No file availabe for download" });
    }
    console.log(req.session.uploadedFiles)
    var filename = req.session.uploadedFiles[0]?.filename;
    filename = path.parse(filename).name

    try {
        const result = await connection.run(`SELECT * FROM "${filename}"`);
        console.log(result)
        const rowObjects = await result.getRowObjectsJson();


        const worksheet = XLSX.utils.json_to_sheet(rowObjects);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");

        const exportPath = path.join(`uploads/${filename}.xlsx`);
        XLSX.writeFile(workbook, exportPath);

        res.download(exportPath, `${filename}.xlsx`, (err) => {
            if (err) {
                console.error("Download error:", err);
                res.status(500).send("Failed to download file.");
            }

            fs.unlink(exportPath, () => { });
        });

    } catch (err) {
        console.error("Failed to export table:", err);
        res.status(500).json({ error: "Failed to generate Excel file." });
    }
}