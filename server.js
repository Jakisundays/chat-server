const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose").set("strictQuery", false);
const socket = require("socket.io");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const messageRoutes = require("./routes/message");
app.use("/api/message", messageRoutes);

//Connection
mongoose.connect(
  `mongodb+srv://jakiSundays:${process.env.MONGODB_PASSWORD}@windows98.zbbwuad.mongodb.net/?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => console.log("connected to db")
);

app.get('/', (req,res) => {
  res.send('hello world')
})

//Socket.io
const server = app.listen(
  PORT,
  console.log(`server running on: http://localhost:${PORT}`)
);

const io = socket(server, {
  cors: {
    origin: "*",
  },
});

//Online users:
global.onlineUsers = new Map();

//Connection with client
io.on("connection", (socket) => {
  global.chatSocket = socket;
  //Add userId with SocketId to global.onlineUsers once the client is connected
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  //receive data from client (to, from, message)
  socket.on("send-msg", (data) => {
    //Get socket.id from the online user
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      // send to individual socketid (private message)
      socket.to(sendUserSocket).emit("msg-receive", data.message);
    }
  });

  //Listening to the connect_error events
  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });
});
