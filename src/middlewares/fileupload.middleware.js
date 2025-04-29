import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        console.log(path.extname(file.originalname))

        if (path.extname(file.originalname) === ".xlsx") {
            const filename = `${uuidv4()}.xlsx`;
            cb(null, filename);
        } else {
            cb(new Error("Unsupported file type"), false);
        }
    }
})

export const upload = multer({ storage });