import { DuckDBInstance } from '@duckdb/node-api';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const dbPath = path.join(__dirname, 'duckdb.db'); 
const instance = await DuckDBInstance.create();
const connection = await instance.connect();

export { connection };
