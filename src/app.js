const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require('cors')
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth")
const profileRouter = require("./routes/profile")
const requestRouter = require("./routes/requests");
const { userRouter } = require("./routes/user");

app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter)

connectDB()
  .then(() => {
    console.log("Connected to DataBase Successfully!");
    app.listen(process.env.PORT , () => {
      console.log("Server is listening at port 3000");
    });
  })
  .catch((err) => {
    console.error("DataBase Cannot be connected!");
  });
