const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://saimsaeed625:vsAHrXq9PiDtH2vy@saimdev.v7wqf.mongodb.net/devMate"
  );
};

module.exports = connectDB;