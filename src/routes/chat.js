const express = require("express");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middlewares/auth");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetedUserId", userAuth, async (req, res) => {
  const { targetedUserId } = req.params;
  const userId = req.user._id;
  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetedUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName imageURL",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetedUserId],
        messages: [],
      });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = chatRouter;
