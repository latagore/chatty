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
    if (data === '{"type":"ping"}') { // send pong if recieved a ping.
        ws.send('{"type":"pong"}');
    }
});
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.broadcast = (data) => {
  data.id = uuidv4();
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  })
}

const clients = [];
wss.on('connection', (ws) => {
  console.log('Client connected');
  const clientId = uuidv4();

  clientConnected(ws, clientId);

  ws.on('message', (message) => {
    message = JSON.parse(message);
    if (message.type === "postNotification") {
      message.type = "incomingNotification";
    } else if (message.type === "postMessage") {
      message.type = "incomingMessage";
    } else if (message.type === "changeUsername") {
      wss.broadcast({
        type: "incomingNotification",
        content: `${clients[clientId].username} changed their name to ${message.newUsername}.`
      });
      clients[clientId].username = message.newUsername;
      return;
    } else if (message.type === "postSetup") {
      clients[clientId].username = message.username;

      // broadcast after the client tells us they have connected
      wss.broadcast({
        type: 'incomingNotification',
        content: `${message.username} has connected.`
      });

      return;
    } else if (message.type === "ping") {
      // ignore message, is for ws-heartbeat
      return;
    } else {
      return console.log(`invalid request type "${message.type}"`);
    }
    wss.broadcast(message);
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    clientDisconnected(ws, clientId);
    console.log('Client disconnected');
  });
});

function broadcastUpdatedUsers() {
  wss.broadcast({
    type: "connectedUsersUpdated",
    number: Array.from(wss.clients.values()).filter((client) => client.readyState === WebSocket.OPEN).length
  });
}

// Connection event
function clientConnected(ws, clientId) {
  // Create client data
  clients[clientId] = {
    id: clientId,
    color: getRandomColor()
  }


  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({
      type: 'incomingSetup',
      data: clients[clientId]
    }))
    broadcastUpdatedUsers();
  }
}

// Disconnection event
function clientDisconnected(ws, clientId) {
  const client = clients[clientId];
  if (!client) return; // catch race condition

  wss.broadcast({
    type: 'incomingNotification',
    content: `${client.username} has disconnected.`
  });
  clients[clientId] = undefined;

  broadcastUpdatedUsers();
}

const RANDOM_COLORS = ["#1a6aed", "#1aed52", "#ed8a1a", "#711aed"];
function getRandomColor() {
  const index = Math.floor(Math.random() * RANDOM_COLORS.length);
  return RANDOM_COLORS[index];
}
