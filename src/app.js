const express = require("express");
const connectDB = require("./config/database");

const app = express();
const User = require("./models/user");

app.post("/signup", async (req, res) => {
  const user = new User({
    firstName: "code",
    lastName: "base",
    emailId: "code@base.com",
    age: 35,
    password: "codebase35"
  });
  try {
    await user.save();
    res.send("User Added Successfully!");
  } catch (err) {
    res.status(400).send("Error Saving User" + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Connected to DataBase Successfully!");
    app.listen("3000", () => {
      console.log("Server is listening at port 3000");
    });
  })
  .catch((err) => {
    console.error("DataBase Cannot be connected!");
  });
