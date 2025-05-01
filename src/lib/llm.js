import { OpenAI } from 'openai'
import File from '../models/file.model.js'
import { getExcelData } from './excel.js'
import QueryResult from '../models/queryResult.model.js'
import { ChromaClient } from "chromadb";
import { v4 as uuidv4 } from 'uuid';



const askToLLM = async (prompt) => {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
        model: "gpt-4.1",
        input: prompt
    });

    if (response.status == "completed" && !response.error) {
        return response.output_text
    }
    else if (response.error) {
        console.error("Openai api error :", response.error);
    } else {
        console.error(`Response status : ${response.status}`);
    }
}



export const processQuery = async (input, session, type) => {

    if (type === "structured") {

        let primaryFileId = session.uploadedFiles[0].fileID;
        let secondaryFileId = session.uploadedFiles[1]?.fileID;
        const primaryFile = await File.findById(primaryFileId);

        if (!primaryFile) {
            console.log('File not found');
            return null;
        }

        const secondaryFile = await File.findById(secondaryFileId);
        const previousQueries = await QueryResult.find({ sessionId: session.id }).sort({ createdAt: -1 }).limit(5)

        const lastQueries = previousQueries.map(item => ({
            userQuery: item.query,
            llmResult: item.outputCode
        }));

        // console.log(lastQueries)

        const prompt = `
        you are given a excel metadata which contains the column name and its datatype
            - metadata : ${JSON.stringify(primaryFile.metadata)}
            - User Query : "${input}"
            - Last 5 user queries and results (sorted in descending order, with the latest at the top):
                ${JSON.stringify(lastQueries)} 

        If the operation involves joining data from two sheets, you will receive data from both sheets as input to the function.
        In that case, use the following secondary sheet metadata to generate the appropriate code:
            - Secondary metadata : ${JSON.stringify(secondaryFile?.metadata)}

        Based on the provided metadata and the context of previous queries, determine whether the current user query is a follow-up. 
            - If it is a follow-up, generate the appropriate code to continue the task from the previous query; 
            - If it's not, treat it as a new query and generate a safe and efficient JavaScript function to perform the requested operation. 

        The function name should be always "performUserOperation"
        Only include the function body. Do not access external resources.the answer returned should be an object`

        console.log(prompt)

        let outputCode = await askToLLM(prompt);

        if (outputCode.startsWith("```javascript")) {
            outputCode = outputCode.substring(13)
            outputCode = outputCode.slice(0, -3)
        }
        // console.log(outputCode)

        outputCode = `${outputCode}\nreturn performUserOperation;`;
        const dynamicFunction = new Function(outputCode)();
        // console.log(typeof dynamicFunction)
        const primaryData = await getExcelData(primaryFile.filename);

        if (secondaryFile) {
            var secondaryData = await getExcelData(secondaryFile.filename);
        }

        const result = dynamicFunction(primaryData, secondaryData);

        console.log(result)

        await QueryResult.create({
            sessionId: session.id,
            primaryFileId,
            secondaryFileId,
            query: input,
            outputCode,
            result: result
        });

        return result;
    }
    else {
        let embeddings = await createEmbeddings(input)
        const chroma = new ChromaClient({ path: process.env.CHROMADB_URI });

        const collection = await chroma.getOrCreateCollection({
            name: "excel-sheet-embeddings",
        });

        const results = await collection.query({
            queryEmbeddings: embeddings,
            nResults: 2,
            where: {
                sessionId: { $eq: session.id }
            },
        });

        console.log(results.documents)

        let prompt = `You are given a set of documents.
        Analyse the documents and answer the user’s query based on the information contained in the documents below.
            - User query : ${input}
            - Documents  : ${results.documents}
          `

        let result = await askToLLM(prompt)
        return { "answer": result }
    }

}

export const createEmbeddings = async (input) => {

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
        const response = await client.embeddings.create({
            model: "text-embedding-3-small",
            input,
        });
        return response.data[0].embedding;
    } catch (err) {
        console.error("Error in createEmbeddings:", err);
        return null;
    }
}


export const addToChromaDB = async (embeddings, chunk, sessionId) => {

    const chroma = new ChromaClient({ path: process.env.CHROMADB_URI });

    const collection = await chroma.getOrCreateCollection({
        name: "excel-sheet-embeddings",
    });

    const chunkAsString = chunk.join(" ");
    
    await collection.add({
        ids: [uuidv4()],
        embeddings,
        documents: [chunkAsString],
        metadatas: [{ sessionId }],
    });

}



