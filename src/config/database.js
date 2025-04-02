const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(process.env.DB_CONNECTON_STRING);
};

module.exports = connectDB;
