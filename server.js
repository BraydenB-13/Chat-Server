const net = require("net");
const fs = require("fs");
const chatLog = fs.createWriteStream("./chat.log");

let server = net.createServer();

let sockets = [];

server.on("connection", (socket) => {
  socket.setEncoding("utf-8");
  socket.id = sockets.length;
  socket.name = `User${(socket.id + 1)}`;
  sockets.push(socket);
  socket.write(`Welcome ${socket.name}`);
    for (let i = 0; i < sockets.length; i++) {
      if (sockets[i] != socket) {
        sockets[i].write(`${socket.name} has joined the chat`);
      }
    }
  console.log(`Welcome to the chat ${socket.name}`);
  log(`${socket.name} has connected`);

  socket.on("data", (data) => {
    if (data.charAt(0) === "/") {
      socket.emit("command", data);
    } else {
      log(`${socket.name}: ${data}`);
      for (let i = 0; i < sockets.length; i++) {
        if (sockets[i] != socket) {
          sockets[i].write(`${socket.name}: ${data}`);
        }
      }
    }
  });

  function log(data) {
    chatLog.write(data + '\n');
  }

  socket.on("command", (data) => {
    var command = data.split(" ").shift().trim();
    if (command == "/clientList") {
      clientList();
    } else if (command == "/username"){
      username(data);
    } else if (command == "/kick"){
      kick(data);
    } else if (command == "/w"){
      whisper(data);
    } else {
      socket.write(`${command} is not a command`);
    }
  });

  function clientList() {
    for (let i = 0; i < sockets.length; i++) {
      if (i == (sockets.length - 1)) {
        var comma = "";
      } else {
        var comma = ","
      }
      socket.write(`${sockets[i].name}${comma} `);
    }
  }

  function username(data) {
    var newName = data.replace("/username", "").trim();
    var oldName = socket.name;
    var incorrect = 0;
    if (newName == oldName) {
      socket.write(`${newName} is already your username`);
      incorrect ++;
    } else for (let i = 0; i < sockets.length; i++) {
      if (newName == sockets[i].name) {
        socket.write(`${newName} is already in use`);
        incorrect ++;
      }
    }
    if (incorrect == 0) { 
      for (let i = 0; i < sockets.length; i++) {
        if (sockets[i] != socket) {
          sockets[i].write(`${oldName} has changed his username to ${newName}`);
        }
      }
      socket.name = newName;
      socket.write(`Username changed to ${newName}`);
    }
  }

  function kick(data) {
    var newData = data.replace("/kick", "").trim();
    var incorrect = 0;
    var count = sockets.length;
      if (newData.includes("asdf")) {
        var kick = newData.replace("asdf", "").trim();
        if (kick == socket.name) {
          socket.write(`you cannot kick yourself`);
        } else {
          for (let i = 0; i < sockets.length; i++) {
            if (kick == sockets[i].name) {
              sockets[i].emit("end");
            } else {
              incorrect ++;
            }
          }
          if (incorrect == count) {
            console.log(incorrect);
            socket.write(`${kick} is not in the chat`);
          }
        }
      } else {
        socket.write("incorrect password");
      }
  }

  function whisper(data) {
    var receiver = data.replace("/w", "").trim().split(" ").shift();
    var message = data.replace("/w", "").trim().split(" ");
    var incorrect = 0;
    if (receiver == socket.name) {
      socket.write(`You cannot send a whisper to yourself`);
    } else {
      for (let i = 0; i < sockets.length; i++) {
        if (receiver == sockets[i].name) {
          sockets[i].write(`${socket.name} whispered: ${message[1]}`);
        } else {
          incorrect ++;
        }
      }
      if (incorrect == sockets.length) {
        socket.write(`${receiver} is not in the chat`);
      }
    }
  }

  socket.on("end", () => {
    for (let i = 0; i < sockets.length; i++) {
      if (sockets[i] != socket) {
        sockets[i].write(`${socket.name} has left the chat`);
      } else {
        if (sockets[i] == socket) {
          log(`${socket.name} disconnected`);
          sockets.splice(i, 1);
        }
      }
    }
  });

  socket.on("error", (err) => {
    if (err) console.log(err);
  });
});

server.listen(3000);
console.log("Server created at port 3000");