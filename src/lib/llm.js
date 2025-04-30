import { OpenAI } from 'openai'
import File from '../models/file.model.js'
import { getExcelData } from './excel.js'


export const processQuery = async (input, session) => {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });



    let fileId = session.uploadedFiles[0].fileID;


    const file = await File.findById(fileId);

    if (!file) {
        console.log('File not found');
        return null;
    }

    // try {
    const prompt = `you are given a excel metadata which contains the column name and its datatype
        - metadata : ${JSON.stringify(file.metadata)}
        - User Query : "${input}"

        Generate a safe and efficient JavaScript function that returns the answer to the user query.
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
        outputCode = outputCode.replace(/`/g, '')

        if (outputCode.startsWith("javascript")) {
            outputCode = outputCode.substring(10)
        }
        console.log(outputCode)
      

        outputCode = `${outputCode}\nreturn performUserOperation;`;


        const dynamicFunction = new Function(outputCode)();
        console.log(typeof dynamicFunction)
        const data = await getExcelData(file.filename);
        const result = dynamicFunction(data);
        console.log(result)
        return result;


    } else if (response.error) {
        console.error("Openai api error :", response.error);
    } else {
        console.error(`Response status : ${response.status}`);
    }

}