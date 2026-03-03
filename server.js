const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let users = {};
let friendships = {};
let messages = {};

app.post("/register", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Nome inválido" });

  if (!users[username]) {
    users[username] = { username };
    friendships[username] = [];
  }

  res.json({ success: true });
});

app.post("/add-friend", (req, res) => {
  const { user, friend } = req.body;

  if (!users[friend]) return res.status(404).json({ error: "Usuário não existe" });

  if (!friendships[user].includes(friend)) {
    friendships[user].push(friend);
  }

  res.json({ success: true });
});

app.get("/friends/:user", (req, res) => {
  res.json(friendships[req.params.user] || []);
});

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    socket.username = username;
  });

  socket.on("message", ({ to, msg }) => {
    io.emit("message", {
      from: socket.username,
      to,
      msg
    });
  });

});

server.listen(3000, () => {
  console.log("FORTS Server rodando na porta 3000");
});