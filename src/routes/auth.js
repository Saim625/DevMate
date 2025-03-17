const express = require("express");
const { validateSignUp } = require("../utils/validation");
const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUp(req);
    const {
      firstName,
      lastName,
      emailId,
      password,
      gender,
      age,
      skills,
      about,
      imageURL
    } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      gender,
      age,
      skills,
      about,
      imageURL
    });
    const savedUser =  await user.save();
    const token = await user.getJWT();
    res.cookie("token", token,{
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.json({message:"User Added Successfully!",data: savedUser});
  } catch (err) {
    res.status(400).send("Error Saving User" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Enter a valid email");
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid Cradentials");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token,{
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send(user);
    } else {
      throw new Error("Invalid Cradentials");
    }
  } catch (err) {
    res.status(401).send("Something went wrong: " + err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("User Logout");
});

module.exports = authRouter;
