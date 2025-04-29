export const query = async (req, res) => {
    try {
        console.log(req.session.uploadedFiles)

        if (!req.session.uploadedFiles || req.session.uploadedFiles === 0) {
            return res.status(200).json({ message: "No dataset available. Please upload a  dataset first" });
        }
        
    } catch (error) {
        console.error("Error in query function", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const uploadFile = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        console.log(file)

        // console.log(req.session)
        if (!req.session.uploadedFiles) {
            req.session.uploadedFiles = [];
        }

        req.session.uploadedFiles.push({ originalname: file.originalname, filename: file.filename })
        console.log(req.session)


        return res.status(200).json({ fileName: file.filename });
    } catch (error) {
        console.error("Error in query function", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
