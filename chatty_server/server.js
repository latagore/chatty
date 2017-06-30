// server.js

const express = require('express');
const WebSocket = require('ws');
const SocketServer = require('ws').Server;
const uuidv4 = require('uuid/v4');
const { setWsHeartbeat } = require("ws-heartbeat/server");


// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });
setWsHeartbeat(wss, (ws, data, pong) => {
    if (data === '{"kind":"ping"}') { // send pong if recieved a ping.
        ws.send('{"kind":"pong"}');
    }
});
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  })
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  wss.broadcast({
    type: "connectedUsersUpdated",
    number: Array.from(wss.clients.values()).filter((client) => client.readyState === WebSocket.OPEN).length
  });

  ws.on('message', (data) => {
    data = JSON.parse(data);
    data.id = uuidv4();
    if (data.type === "postNotification") {
      data.type = "incomingNotification";
    } else if (data.type === "postMessage") {
      data.type = "incomingMessage";
    } else if (data.kind === "ping") {
      // ignore message, is for ws-heartbeat
      return;
    } else {
      return console.log(`invalid request type "${data.type}"`);
    }
    wss.broadcast(data);
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected')
    wss.broadcast({
      type: "connectedUsersUpdated",
      number: Array.from(wss.clients.values()).filter((client) => client.readyState === WebSocket.OPEN).length
    });
  });
});
