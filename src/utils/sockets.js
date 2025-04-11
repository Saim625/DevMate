const socket = require("socket.io");
const crypto = require("crypto");

const getSecretRoomId = (userId, targetedUserId)=>{
  return crypto
    .createHash("sha256")
    .update([userId, targetedUserId].sort().join("_"))
    .digest("hex")
}


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
      console.log(firstName + " joined room : " + roomId);
    });

    socket.on(
      "sendMessage",
      ({ firstName, userId, targetedUserId, text }) => {
        const roomId = getSecretRoomId(userId, targetedUserId) ;
        console.log(firstName + " " + text)
        io.to(roomId).emit("messageReceived", {firstName, text})
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSockets;
