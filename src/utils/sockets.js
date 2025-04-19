const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getSecretRoomId = (userId, targetedUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetedUserId].sort().join("_"))
    .digest("hex");
};

const initializeSockets = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetedUserId }) => {
      const roomId = getSecretRoomId(userId, targetedUserId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetedUserId, text, image }) => {
        try {
          const roomId = getSecretRoomId(userId, targetedUserId);
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetedUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetedUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
            image,
          });

          await chat.save();

          const newMsg = chat.messages[chat.messages.length - 1];

          io.to(roomId).emit("messageReceived", {
            firstName,
            text: newMsg.text,
            image: newMsg.image,
            createdAt: newMsg.createdAt,
          });
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSockets;
