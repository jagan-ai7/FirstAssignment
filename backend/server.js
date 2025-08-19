require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const sequelize = require("./config/database");
const userRoutes = require("./routes/users");
const { createMessage } = require("./controllers/messageController");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors());
app.use("/users", userRoutes);

const users = {};

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // When user logs in, store their socket.id by userId
  socket.on("login", (userId) => {
    users[userId] = socket.id;
    console.log(`User logged in: ${userId}`);

    // Broadcast updated user list to everyone
    io.emit("users_update", Object.keys(users));
  });

  // Listen for private message: { from, to, message }
  socket.on("private_message", ({ from, to, message }) => {
    const recipientSocketId = users[to];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("private_message", { from, message });
    } else {
      console.log(`User ${to} not online`);
      // Optionally handle offline messages here
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        console.log(`User disconnected: ${userId}`);
        // Broadcast updated user list after disconnect
        io.emit("users_update", Object.keys(users));
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
