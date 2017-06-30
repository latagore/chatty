import React, { Component } from 'react';
import { setWsHeartbeat } from "ws-heartbeat/client";
import NavBar from './NavBar.jsx';
import MessageList from './MessageList.jsx'
import ChatBar from './ChatBar.jsx';

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentUser: {name: "Bob"}, // optional. if currentUser is not defined, it means the user is Anonymous
      messages: [
        {
          id: 0,
          username: "Bob",
          content: "Has anyone seen my marbles?",
        },
        {
          id: 1,
          username: "Anonymous",
          content: "No, I think you lost them. You lost your marbles Bob. You lost them for good."
        }
      ]
    };
  }

  componentDidMount() {
    this.socket = new WebSocket("ws://localhost:3001/");
    this.socket.onopen = () => {
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'connectedUsersUpdated') {
          this.setState({usersOnline: data. number});
          return;
        } if (data.kind === "pong") {
          // ignore pong messages from ws-heartbeat
          return;
        }
        this._addMessage(data);
      }

      // tell the server we are stil alive
      setWsHeartbeat(this.socket, '{"kind":"ping"}');
    }
  }

  _onMessage(message) {
    message.type = "postMessage";
    this.socket.send(JSON.stringify(message));
  }

  _addMessage(message) {
    this.setState({messages: this.state.messages.concat([message])});
  }

  _onUsernameChange(user) {
    const oldUsername = this.state.currentUser.name;
    if (oldUsername !== user.name) {
      this.setState({ currentUser: user });
      this.socket.send(JSON.stringify({type: "postNotification", content: `${oldUsername} changed their name to ${user.name}.` }));
    }
  }

  render() {
    return (
      <div>
        <NavBar usersOnline={this.state.usersOnline}/>
        <MessageList messages={this.state.messages}/>
        <ChatBar currentUser={this.state.currentUser} onUsernameChange={this._onUsernameChange.bind(this)} onMessage={this._onMessage.bind(this)} />
      </div>
    );
  }
}
export default App;
