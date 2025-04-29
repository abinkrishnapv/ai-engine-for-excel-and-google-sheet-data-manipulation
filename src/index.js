import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
// import swaggerUi from "swagger-ui-express";
// import swaggerJSDoc from "swagger-jsdoc";
import userActionsRoutes from "./routes/userActions.route.js"

dotenv.config();


const app = express();
const PORT = process.env.PORT;
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
});