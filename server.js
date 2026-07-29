require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const PORT = process.env.PORT || 5000;

require("./db/connection");
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

global.io = io;
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });
  socket.on("disconnect", () => {
    console.log("Socket Disconnected:", socket.id);
  });
});

const router = require("./routes/index.routes");
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("API running 🚀");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
