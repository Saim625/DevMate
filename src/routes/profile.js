const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateProfileEdit } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Something went wrong: " + err.message);
  }
});

profileRouter.post("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEdit(req)) {
      throw new Error(
        "Invalid field(s) in the request. Only the following fields can be updated: firstName, lastName, age, gender, about, imageURL, skills."
      );
    }
    const loggedInUser = req.user;
    const updatedFields = Object.keys(req.body).forEach(
      (field) => (loggedInUser[field] = req.body[field])
    );
    await loggedInUser.save();
    res.send(loggedInUser.firstName + " your profile has been updated");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/update-password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;
    const comparePassword = await bcrypt.compare(oldPassword, user.password);
    if (!comparePassword) {
      return res.status(400).json({message: "Invalid old password"})
    }

    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long, include uppercase, lowercase, numbers, and special characters.",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res.json({message: "Password updated succeefully"})
  } catch (err) {
    return res.status(400).send("ERROR: " + err.message);
  }
});
module.exports = profileRouter;
