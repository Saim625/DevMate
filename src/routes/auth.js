const express = require("express");
const { validateSignUp } = require("../utils/validation");
const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUp(req);
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User Added Successfully!");
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
      res.cookie("token", token);
      res.send(user);
    } else {
      throw new Error("Invalid Cradentials");
    }
  } catch (err) {
    res.send("Something went wrong: " + err.message);
  }
});

authRouter.post("/logout", (req,res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now())
  })
  res.send("User Logout")
})

module.exports = authRouter;