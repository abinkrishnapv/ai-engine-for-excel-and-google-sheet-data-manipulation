import dotenv from "dotenv"
dotenv.config()

import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const NUMBER_OF_COLUMNS = 30;
const NUMBER_OF_ROWS = 10000;


import { faker } from '@faker-js/faker';
import ExcelJS from "exceljs";

async function createDataset(columnMetadataJSON, filename) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sheet1');

    const headers = columnMetadataJSON.map(item => item.name);
    sheet.addRow(headers);
    // console.log(columnNamesArray)

    for (let i = 0; i < NUMBER_OF_ROWS; i++) {

        let row = []
        for (const item of columnMetadataJSON) {

            let method = item.type.split('.');
            var fakerTypeFuntion = faker?.[method[0]]?.[method[1]];

            if (typeof fakerTypeFuntion === 'function') {
                let value = item.options ? fakerTypeFuntion(item.options) : fakerTypeFuntion();
                row.push(value);
            } else {
                row.push("");
            }

        };
        // console.log(row)
        sheet.addRow(row);

    }
    console.log(`Filename : ${filename}`);
    await workbook.xlsx.writeFile(filename);


}



const response = await client.responses.create({
    model: "gpt-4.1",
    input: `
        1.Generate a array with ${NUMBER_OF_COLUMNS} columns names for a structured dataset. For each column, provide:
            - Name of the column
            - Data type (faker.js method, like "person.fullName", "number.int", "location.city", "phone.number", etc.)
            - If the faker method requires additional parameters (like min/max for number.int), include "options" field.
            - Use the latest version of @faker-js/faker, version 9.1.0 or newer.after  version 9.1.0, use faker.internet.username() instead of faker.internet.userName()
            - if data type is date.birthdate in the option should include the mode (eg: "options": { "mode": "year", "min": 1950, "max": 2005 } )
            
            Return the table in JSON format. Example:
            [
                { "name": "user_id", "type": "person.fullName" },
                { "name": "age", "type": "number.int", "options": { "min": 18, "max": 100 } },
                { "name": "dateofbirth", "type": "data.birthdate", "options": { mode: 'year', min: 1900, max: 2000 }},
                { "name": "email", "type": "internet.email" }
                ...
            ]

        2. After the array, add a second JSON object containing:
            - "file_name": Suggested file name (e.g., "synthetic_finance_data_set.xlsx")
            - "description": Short text describing the overall dataset.

        Return everything inside a single JSON array:
        [
            [ array of column objects ],
            { file_name: "filename.xlsx", description: "..." }
        ]
`
});


if (response.status == "completed" && !response.error) {

    let output = response.output_text;
    output = output.replace(/`/g, '')

    if (output.startsWith("json")) {
        output = output.substring(4)
    }
    console.log(output)
    try {
        let outputJSON = JSON.parse(output);
        // console.log(outputJSON);
        createDataset(outputJSON[0], outputJSON[1].file_name);

    } catch (error) {
        console.error("Invalid JSON:", error);
    }



} else if (response.error) {
    console.error("Openai api error :", response.error);
} else {
    console.error(`Respoonse status : ${response.status}`);
}

