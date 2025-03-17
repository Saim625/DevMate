const express = require("express");
const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../models/connectionRequest");
const user = require("../models/user");

const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName age gender skills about imageURL";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const pendingRequests = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", USER_SAFE_DATA);
    res.json({
      message: "Requests Found successfully",
      data: pendingRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await connectionRequest
      .find({
        $or: [
          { fromUserId: loggedInUser._id, status: "accepted" },
          { toUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connections.map((row) => {
      const user =
        row.fromUserId._id.toString() === loggedInUser._id.toString()
          ? row.toUserId.toObject()
          : row.fromUserId.toObject();

      return {
        connectionId: row._id,
        ...user,
      };
    });
    res.json({ data });
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
  }
});

userRouter.delete("/user/connection/remove/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await connectionRequest.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Connection removed" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error removing connection" });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await connectionRequest
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select("fromUserId toUserId");

    const hideUserFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUserFromFeed.add(req.fromUserId.toString());
      hideUserFromFeed.add(req.toUserId.toString());
    });

    const users = await user
      .find({
        $and: [
          { _id: { $nin: Array.from(hideUserFromFeed) } },
          { _id: { $ne: loggedInUser._id } },
        ],
      })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.send(users);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = {
  userRouter,
};
