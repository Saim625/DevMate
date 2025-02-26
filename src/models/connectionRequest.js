const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["accepted", "rejected", "ignore", "interested"],
      values: `{VALUE} is incorrect status type`,
    },
  },
  { timestamps: true }
);

connectionRequestSchema.pre("save", function(next){
  if (this.fromUserId.equals(this.toUserId)) {
    return next(new Error("You can't send a request to yourself"));
  }
  next()
})

module.exports = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);
