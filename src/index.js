import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import userActionsRoutes from "./routes/userActions.route.js"
import { connectDB } from "./lib/db.js";
import fs from "fs"
import path from "path";
import { DuckDBInstance } from '@duckdb/node-api'



dotenv.config();


const app = express();
const PORT = process.env.PORT;




const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json'), 'utf8');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const SESSION_SECRET = process.env.SESSION_SECRET;
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 }
}))

app.use(express.json());
app.use(cookieParser())


app.use("/userActions", userActionsRoutes)

app.use((err, req, res, next) => {
  if (err.message === "Unsupported file type") {
    return res.status(415).json({ message: "Unsupported file type. Only Excel or CSV files are allowed." });
  }
  next(err);
});


app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
  connectDB();
});