const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

io.on("connection", socket => {
    console.log("User connected:", socket.id);

    socket.on("join-room", roomId => {
        socket.join(roomId);

        socket.to(roomId).emit("user-connected", socket.id);

        socket.on("offer", data => {
            socket.to(roomId).emit("offer", data);
        });

        socket.on("answer", data => {
            socket.to(roomId).emit("answer", data);
        });

        socket.on("ice-candidate", data => {
            socket.to(roomId).emit("ice-candidate", data);
        });
    });
});

server.listen(3000, () => console.log("Server running on port 3000"));