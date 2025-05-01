import dotenv from "dotenv"
dotenv.config()

import OpenAI from "openai";
import ExcelJS from "exceljs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Sheet1');

async function getData() {

    const response = await client.responses.create({
        model: "gpt-4.1",
        input: `
            Generate 100 unique synthetic tweets. Each tweet should be realistic and contain at least the following elements:
                1. One or more @mentions (eg: @username)
                2. An event or location (eg: "Friends marriage", "Visiting tajmahal")
                3. Clear sentiment (eg: "feeling happy")
                4. One or more hashtags (eg: #Gaming, #Sports)
                5. A shortened link (eg: http://bit.ly/12345)
    
                Keep each tweet under 300 characters. Vary topics across sports, tech, food, business, and culture to make the dataset . Use informal, human-like tone typical of Twitter posts. Don't and any emoji's
                ***Return everything inside a single array***
    `
    });


    if (response.status == "completed" && !response.error) {
        let output = response.output_text;
        if (output.startsWith("```json")) {
            output = output.substring(7)
            output = output.slice(0, -3)
        }
        output = JSON.parse(output);
        console.log(output)

        for (let i = 0; i < output.length; i++) {
            sheet.addRow([output[i]]);
        }


    } else if (response.error) {
        console.error("Openai api error :", response.error);
    } else {
        console.error(`Respoonse status : ${response.status}`);
    }

}


for (var i = 0; i <= 10; i++) {
    await getData()
}

await workbook.xlsx.writeFile("UnStructuredData.xlsx");
