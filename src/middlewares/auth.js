const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Please login again");
    }
    const decodedData = await jwt.verify(token, "Dev@Mate$4322");
    const { id } = decodedData;
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message)
}
};

module.exports = {
  userAuth,
};
