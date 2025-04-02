const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const requestRouter = express.Router();
const sendEmail = require("../utils/sendEmail");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status request" });
      }

      const existingConnectionRequests = await ConnectionRequest.find({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequests.length > 0) {
        return res
          .status(400)
          .json({ message: "Connection request already sent" });
      }

      const userExist = await User.findById(toUserId);
      if (!userExist) {
        return res.status(404).json({ message: "User not found" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      const emailRes = await sendEmail.run("Request Send");
      console.log(emailRes);
      res.json({
        message: "Connection request sent successfully",
        data,
      });
    } catch (err) {
      res.status(400).send("Something went wrong: " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const requestId = req.params.requestId;
      const status = req.params.status;

      const allowedStatus = ["accepted", "rejected"];

      // Validate the status
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not valid" });
      }

      // Find the connection request
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested", // Ensure the request is in the "interested" state
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      // Update the status dynamically based on the request parameter
      connectionRequest.status = status; // Set to either "accepted" or "rejected"

      // Save the updated connection request
      const data = await connectionRequest.save();

      // Send a response indicating the action taken
      res.json({ message: `Connection request ${status}`, data });
    } catch (err) {
      res.status(400).send("Something went wrong " + err.message);
    }
  }
);

module.exports = requestRouter;
