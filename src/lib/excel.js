import ExcelJS from "exceljs";
import fs from "fs";
import path from 'path'
import XLSX from 'xlsx'
import { connection } from "./duckdb.js";


export const getExcelMetadata = async (file) => {
    const workbook = new ExcelJS.Workbook();
    const stream = fs.createReadStream(`uploads/${file.filename}`);

    await workbook.xlsx.read(stream);

    var rows = [];
    const worksheet = workbook.getWorksheet(1);

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 2)
            return
        rows.push(row.values.slice(1));
    })

    var metadata = {}

    for (let i = 0; i < rows[1].length; i++) {
        metadata[rows[0][i]] = typeof rows[1][i];
    }

    return metadata;
}

export const getExcelData = async (filename) => {
    const workbook = new ExcelJS.Workbook();
    const stream = fs.createReadStream(`uploads/${filename}`);

    await workbook.xlsx.read(stream);

    const worksheet = workbook.getWorksheet(1);
    const sheetHeaders = worksheet.getRow(1).values.slice(1);
    const data = [];

    worksheet.eachRow((row, rowIndex) => {
        if (rowIndex > 1) {
            const rowData = {};

            sheetHeaders.forEach((header, index) => {
                rowData[header] = row.getCell(index + 1).value;
            });

            data.push(rowData);
        }
    });

    return data;

}


export const getExcelDataArray = async (filename) => {
    const workbook = new ExcelJS.Workbook();
    const stream = fs.createReadStream(`uploads/${filename}`);

    await workbook.xlsx.read(stream);

    const worksheet = workbook.getWorksheet(1);

    let data = [];

    worksheet.eachRow((row, rowIndex) => {
        data.push(row.values.slice(1));
    });

    data = data.map(item => item[0]);

    return data;
}


export const convertSheetToCSV = (filename) => {
    const workbook = XLSX.readFile(filename);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    const { dir, name } = path.parse(filename);
    fs.writeFileSync(path.join(dir, `${name}.csv`), csv, 'utf-8');
};


export const createDuckDBTableFromSheet = async (filename) => {

    const workbook = XLSX.readFile(filename);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    const { dir, name } = path.parse(filename);
    fs.writeFileSync(path.join(dir, `${name}.csv`), csv, 'utf-8');

  
    let csvFilePath = path.join(dir, `${name}.csv`)
    const tableName = path.parse(csvFilePath).name;
    console.log(tableName);

    const query = `
    CREATE TABLE "${tableName}" AS 
    SELECT * FROM read_csv_auto('${csvFilePath}', AUTO_DETECT=TRUE);
  `;

    try {
        await connection.run(query);
        console.log(`Table '${tableName}' created successfully.`);
        return { connection, tableName };
    } catch (err) {
        console.error('Failed to create table from CSV:', err);
        throw err;
    }
};

export const getTableSchema = async (tableName) => {
    try {
        const result = await connection.run(`PRAGMA table_info('${tableName}')`);
        console.log(result)
        const rowObjects = await result.getRowObjectsJson();
        console.log(rowObjects)


        const schema = rowObjects.map(row => ({
            column: row.name,
            type: row.type
        }));

        console.log(schema)

        return schema;
    } catch (error) {
        console.error(`Failed to get schema for table "${tableName}":`, error);
        throw error;
    }
};
