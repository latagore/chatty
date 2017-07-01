import React, { Component } from 'react';
import { setWsHeartbeat } from "ws-heartbeat/client";
import NavBar from './NavBar.jsx';
import MessageList from './MessageList.jsx'
import ChatBar from './ChatBar.jsx';

// converts empty strings into "Anonymous"
function getUsernameFrom(value) {
  if (!value) {
    return "Anonymous";
  }
  return value;
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentUser: {name: ""}, // optional. if currentUser is not defined, it means the user is Anonymous
      messages: []
    };
  }

  componentDidMount() {
    this.socket = new WebSocket("ws://localhost:3001/");
    this.socket.onopen = () => {

      // send a message to setup the chat connection
      this.socket.send(JSON.stringify({
        type: 'postSetup',
        username: getUsernameFrom(this.state.currentUser.name)
      }));

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "setup") {
          const newUser = this.state.currentUser;
          newUser.color = message.data.color;
          this.setState({currentUser: newUser})
        } else if (message.type === 'connectedUsersUpdated') {
          this.setState({usersOnline: message.number});
        } else if (message.type === "incomingMessage" || message.type === "incomingNotification") {
          this._addMessage(message);
        } else if (message.type === "pong") {
          // ignore pong messages from ws-heartbeat
          return;
        } else {
          console.error("unknown message: ", message);
        }
      }

      // tell the server we are stil alive
      setWsHeartbeat(this.socket, '{"type":"ping"}');
    }
  }

  _onMessage(messageContent) {
    const message = {
      type: "postMessage",
      username: getUsernameFrom(this.state.currentUser.name),
      color: this.state.currentUser.color,
      content: messageContent
    };

    this.socket.send(JSON.stringify(message));
  }

  _addMessage(message) {
    this.setState({messages: this.state.messages.concat([message])});
  }

  _onUsernameChange(username) {
    const oldUsername = getUsernameFrom(this.state.currentUser.name);
    const newUsername = getUsernameFrom(username);
    if (oldUsername !== newUsername) {
      this.setState((state) => {
        state.currentUser.name = newUsername;
        return state;
      });
      this.socket.send(JSON.stringify({type: "changeUsername", oldUsername, newUsername: newUsername }));
    }
  }

  render() {
    return (
      <div>
        <NavBar usersOnline={this.state.usersOnline}/>
        <MessageList messages={this.state.messages}/>
        <ChatBar currentUser={this.state.currentUser}
          onUsernameChange={this._onUsernameChange.bind(this)}
          onMessage={this._onMessage.bind(this)} />
      </div>
    );
  }
}
export default App;
