import ExcelJS from "exceljs";
import fs from "fs";


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