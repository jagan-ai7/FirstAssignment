require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const sequelize = require("./config/database");
const userRoutes = require("./routes/users");
const { FriendRequest, Friend, Message } = require("./models");
const { Op } = require("sequelize");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads")),
  userRoutes
);
app.use("/users", userRoutes);

module.exports = { io };

const PORT = process.env.PORT || 5000;

const usersOnline = {}; // userId => socket.id

io.on("connection", (socket) => {
  console.log("📡 User connected:", socket.id);

  socket.on("login", (userId) => {
    usersOnline[userId] = socket.id;
    console.log(`✅ User ${userId} logged in via socket`);
    io.emit("users_update", Object.keys(usersOnline));
  });

  // ✅ Send Friend Request
  socket.on("send_friend_request", async ({ fromUserId, toUserId }) => {
    try {
      // Step 1: Check if already friends
      const isAlreadyFriend = await Friend.findOne({
        where: {
          userId: fromUserId,
          friendId: toUserId,
        },
      });

      if (isAlreadyFriend) {
        const senderSocket = usersOnline[fromUserId];
        if (senderSocket) {
          io.to(senderSocket).emit("error_message", {
            message: "⚠️ You are already friends.",
          });
        }
        return;
      }

      // Step 2: Check if request already exists
      const existingRequest = await FriendRequest.findOne({
        where: {
          fromUserId,
          toUserId,
          status: "pending",
        },
      });

      if (existingRequest) {
        const senderSocket = usersOnline[fromUserId];
        if (senderSocket) {
          io.to(senderSocket).emit("error_message", {
            message: "⏳ Friend request already sent.",
          });
        }
        return;
      }

      // Step 3: Create the friend request
      await FriendRequest.create({ fromUserId, toUserId, status: "pending" });
      socket.emit("friend_request_sent", { toUserId });

      const recipientSocket = usersOnline[toUserId];
      if (recipientSocket) {
        io.to(recipientSocket).emit("friend_request_received", { fromUserId });
      }
    } catch (err) {
      console.error("❌ Error sending friend request:", err);
      const senderSocket = usersOnline[fromUserId];
      if (senderSocket) {
        io.to(senderSocket).emit("error_message", {
          message: "❌ Failed to send friend request.",
        });
      }
    }
  });

  // ✅ Accept Friend Request
  socket.on("accept_friend_request", async ({ fromUserId, toUserId }) => {
    try {
      // ✅ Check if friendship already exists in either direction
      const existingFriend = await Friend.findOne({
        where: {
          [Op.or]: [
            { userId: fromUserId, friendId: toUserId },
            { userId: toUserId, friendId: fromUserId },
          ],
        },
      });

      if (existingFriend) {
        const socketToNotify = usersOnline[toUserId] || usersOnline[fromUserId];
        if (socketToNotify) {
          io.to(socketToNotify).emit("error_message", {
            message: "⚠️ You are already friends.",
          });
        }
        return;
      }

      // ✅ Update the friend request
      await FriendRequest.update(
        { status: "accepted" },
        { where: { fromUserId, toUserId } }
      );

      // ✅ Create mutual friendship
      await Friend.bulkCreate([
        { userId: toUserId, friendId: fromUserId },
        { userId: fromUserId, friendId: toUserId },
      ]);

      console.log("toUserId----------", toUserId);
      const senderSocket = usersOnline[fromUserId];
      if (senderSocket) {
        io.to(senderSocket).emit("friend_request_accepted", {
          userId: toUserId, // The user who accepted the request
        });
      }
      const receiverSocket = usersOnline[toUserId];
      if (receiverSocket) {
        io.to(receiverSocket).emit("friend_request_accepted_by_you", {
          userId: fromUserId,
        });
      }
    } catch (err) {
      console.error("❌ Error accepting friend request:", err.message);
    }
  });

  // ✅ Deny Friend Request
  socket.on("deny_friend_request", async ({ fromUserId, toUserId }) => {
    await FriendRequest.destroy({ where: { fromUserId, toUserId } });

    const senderSocket = usersOnline[fromUserId];
    if (senderSocket) {
      io.to(senderSocket).emit("friend_request_denied", { userId: toUserId });
    }
  });

  // ✅ Private Messaging (only if friends)
  socket.on("private_message", async ({ fromId, toId, message, type }) => {
    try {
      const isFriend = await Friend.findOne({
        where: { userId: fromId, friendId: toId },
      });

      if (!isFriend) {
        const senderSocket = usersOnline[fromId];
        if (senderSocket) {
          io.to(senderSocket).emit("error_message", {
            message: "❌ You can only message friends.",
          });
        }
        return;
      }

      const saved = await Message.create({
        fromId,
        toId,
        content: message,
        type: type || "text",
      });

      const payload = {
        fromId,
        toId,
        message: saved.content,
        type: saved.type,
        id: saved.id,
        timestamp: saved.createdAt,
      };

      const senderSocket = usersOnline[fromId];
      const recipientSocket = usersOnline[toId];

      if (senderSocket) io.to(senderSocket).emit("private_message", payload);
      if (recipientSocket)
        io.to(recipientSocket).emit("private_message", payload);
    } catch (err) {
      console.error("Error sending private message:", err);
    }
  });

  // ✅ Disconnect
  socket.on("disconnect", () => {
    for (const [userId, sockId] of Object.entries(usersOnline)) {
      if (sockId === socket.id) {
        delete usersOnline[userId];
        io.emit("users_update", Object.keys(usersOnline));
        break;
      }
    }
  });
});


// Sync the database
sequelize
  .sync({ alter: true }) // or { force: true } to drop and recreate tables
  .then(() => {
    console.log("Database synchronized successfully.");
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error syncing the database:", error);
  });

// socket.on('send_message', async (data) => {
//   try {
//     const { token, username, content } = data;

//     const messageData = await createMessage(token, username, content);

//     io.emit(`receive_message`, messageData);
//     socket.emit('success_message', 'Message sent successfully!');
//   } catch (error) {
//     console.error('Error in socket:', error.message);
//     socket.emit('error_message', error.message);
//   }
// });

// socket.on('disconnect', () => {
//   console.log('User disconnected:', socket.id);
// });
