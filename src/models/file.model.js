import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalname: {
        type: String,
        required: true
    },
    metadata: {
        type: Object,
        required: true
    }
},
    { timestamps: true },
)


const File = mongoose.model("File", fileSchema);
export default File