import mongoose from 'mongoose';

const queryResultSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },
    query: {
        type: String
    },
    outputCode: {
        type: String
    },
    result: {
        type: Object
    },
},
    { timestamps: true }
);

const QueryResult = mongoose.model("QueryResult", queryResultSchema);
export default QueryResult
