const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT = process.env.PORT || 3000;

const app = express();
dotenv.config();

const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/password");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/password", passwordRoutes);


const connect = () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DATABASE_CONNECTTION_URL).then(() => {
      console.log("Database Connected");
      app.listen(PORT, () => {
        console.log("Server is listening on port :" + PORT);
      });
    });
  } catch (err) {
    console.log(err.message);
  }
};

connect();
