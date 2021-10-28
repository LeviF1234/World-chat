const http = require("http"),
  express = require("express"),
  socketio = require("socket.io"),
  path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "app")));
app.get("/join",(req,res) => {
	res.sendFile(path.join(__dirname, "roomlink.html"));
});
const io = socketio(app.listen(process.env.PORT || 3000,() => {
	console.log("LISTENING");
}));
var rooms = {};
var inrooms = {};
var usernames = {};
io.on('connection', (socket) => {
  "use strict";
  socket.on('join', (room, username, pass, type) => {
    if (room in rooms) {
      if (rooms[room].pass_enabled) {
        if (!pass) {
          socket.emit('alert', "This room requires a passcode - Please enter it when joining the room");
        }
        if (rooms[room].passcode == pass) {
          // Correct pass
          inrooms[socket.id] = room;
          usernames[socket.id] = username;
          socket.leaveAll();
          socket.join(room);
          io.in(room).emit("recieve", {
            "message": `${username} has joined`,
            "id": socket.id
          });
          socket.emit("join", room, pass, type);
        } else {
          socket.emit("alert", "Invalid Password");
        }
      } else {
        // This room does not have a passcode
        inrooms[socket.id] = room;
        usernames[socket.id] = username;
        socket.leaveAll();
        socket.join(room);
        io.in(room).emit("recieve", {
          "message": `${username} has joined`,
          "id": socket.id
        });
        socket.emit("join", room, pass, type);
      }
    } else {
      socket.emit('alert', "That room does not exist");
    }
  });
  socket.on("create", (room_name, pass) => {
    if (!(room_name in rooms)) {
      if (pass) {
        // Make with passcode
        rooms[room_name] = {
          pass_enabled: true,
          passcode: pass
        };
        socket.emit("created", room_name, pass)
      } else {
        // Make without passcode
        rooms[room_name] = {
          pass_enabled: false
        };
        socket.emit("created", room_name, pass)
      }
    } else {
      socket.emit("alert", "That room already exists");
    }
  });
  socket.on("disconnect", () => {
    io.in(inrooms[socket.id]).emit("recieve", {
      "message": `${usernames[socket.id]} has left`,
      "id": socket.id
    });
  });
  socket.on("delete", (room_name) => {
    io.in(room_name).emit("deleted", room_name);
    socket.leave(room_name);
    delete rooms[room_name];
  });
  socket.on("send", (json) => {
    io.in(inrooms[socket.id]).emit("recieve", {
      "message": `${usernames[socket.id]}: ${json.message}`,
      "id": json.id
    });
  });
  socket.on("recieve", (message) => {
    socket.emit("recieve", message);
  });
});