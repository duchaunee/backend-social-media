import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dbConnection from "./db_config/index.js";
// const dbConnection = require("./db_config");
// const errorMiddleware = require("./middlewares/error.middleware");
import errorMiddleware from "./middlewares/error.middleware.js";
import router from "./routes/index.js";
// const router = require("./routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

app.use(
  cors({
    credentials: true, // Cho phép gửi cookie
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://testcookie.com:3000",
      "https://socialmedia254.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

dbConnection();
//
// const a = 1,
//   b = null,
//   c = null,
//   d = null;
// if (!(a && b && c && d)) console.log("hehe");

app.use(cookieParser());
app.use(helmet());
// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

//routes
app.use(router);
app.get(
  "/",
  (req, res, next) => {
    next();
    // const a = async () => {
    //   console.log("in a");
    // };
    // a();
    // console.log(" a(): ", a());
    console.log("ben duoi next middlware_1");
  },
  (req, res, next) => {
    next();
    console.log("ben duoi next middlware_2");
  },
  (req, res, next) => {
    res.cookie("name", "duchau", {
      maxAge: 3600 * 1000,
      sameSite: "None",
      secure: true,
    });
    console.log("middlware_3");
    res.status(200).send("ok 3");
  }
);
//
// app.get(
//   "/",
//   (req, res, next) => {
//     const user = {
//       name: "hau",
//       age: undefined,
//     };
//     next(new Error("co loi"));
//     res.status(200).send("ok1");
//     console.log("ben duoi next ne hiihi");
//   },
//   (req, res, next) => {
//     res.status(200).send("ok2");
//   },
//   (error, req, res, next) => {
//     console.log("error: ", error);
//     res.status(200).send(error);
//   }
// );

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log("Server running on port: ", PORT);
});
