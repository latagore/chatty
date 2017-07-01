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
      this._sendSetup();

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
          if (message.type === 'connectedUsersUpdated') {
          this.setState({usersOnline: message. number});
          return;
        } else if (message.kind === "pong") {
          // ignore pong messages from ws-heartbeat
          return;
        } else if (message.type === "setup") {
          const newUser = this.state.currentUser;
          console.log(message);
          newUser.color = message.data.color;
          this.setState({currentUser: newUser})
        } else if (message.type === "incomingMessage" || message.type === "incomingNotification") {
          this._addMessage(message);
        } else {
          console.error("unknown message: ", message);
        }
      }

      // tell the server we are stil alive
      setWsHeartbeat(this.socket, '{"kind":"ping"}');
    }
  }

  _sendSetup() {
    const setupMessage = {
      type: 'postSetup',
      username: getUsernameFrom(this.state.currentUser.name)
    };
    this.socket.send(JSON.stringify(setupMessage));
  }

  _onMessage(message) {
    message.type = "postMessage";
    message.username = getUsernameFrom(this.state.currentUser.name);
    message.color = this.state.currentUser.color;
    console.log(this.state.currentUser.color);
    this.socket.send(JSON.stringify(message));
  }

  _addMessage(message) {
    this.setState({messages: this.state.messages.concat([message])});
  }

  _onUsernameChange(user) {
    const oldUsername = getUsernameFrom(this.state.currentUser.name);
    const newUsername = getUsernameFrom(user.name);
    console.log(oldUsername, newUsername);
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
