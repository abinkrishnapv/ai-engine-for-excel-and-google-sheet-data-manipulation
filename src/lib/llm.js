import { OpenAI } from 'openai'
import File from '../models/file.model.js'
import { getExcelData } from './excel.js'
import QueryResult from '../models/queryResult.model.js'


export const processQuery = async (input, session) => {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });



    let fileId = session.uploadedFiles[0].fileID;


    const file = await File.findById(fileId);

    if (!file) {
        console.log('File not found');
        return null;
    }

    const previousQueries = await QueryResult.find({ sessionId: session.id }).sort({ createdAt: -1 }).limit(5)

    const lastQueries = previousQueries.map(item => ({
        userQuery: item.query,
        llmResult: item.outputCode
    }));


    console.log(lastQueries)

    // try {
    const prompt = `you are given a excel metadata which contains the column name and its datatype
        - metadata : ${JSON.stringify(file.metadata)}
        - User Query : "${input}"
        - Last 5 user queries and results (sorted in descending order, with the latest at the top):
            ${JSON.stringify(lastQueries)} 

        Based on the provided metadata and the context of previous queries, determine whether the current user query is a follow-up. If it is a follow-up, generate the appropriate code to continue the task from the previous query; otherwise, treat it as a new query and generate a safe and efficient JavaScript function to perform the requested operation. 
        The function name should be always "performUserOperation"
        Only include the function body. Do not access external resources.the answer returned should be an object
        `

    console.log(prompt)



    const response = await client.responses.create({
        model: "gpt-4.1",
        input: prompt
    });


    if (response.status == "completed" && !response.error) {

        let outputCode = response.output_text;
        // outputCode = outputCode.replace(/`/g, '')

        if (outputCode.startsWith("```javascript")) {
            outputCode = outputCode.substring(13)
            outputCode = outputCode.slice(0,-3)
        }
        console.log(outputCode)


        outputCode = `${outputCode}\nreturn performUserOperation;`;


        const dynamicFunction = new Function(outputCode)();
        console.log(typeof dynamicFunction)
        const data = await getExcelData(file.filename);
        const result = dynamicFunction(data);
        console.log(result)

        await QueryResult.create({
            sessionId: session.id,
            fileId,
            query: input,
            outputCode,
            result: result
        });
        return result;


    } else if (response.error) {
        console.error("Openai api error :", response.error);
    } else {
        console.error(`Response status : ${response.status}`);
    }

}