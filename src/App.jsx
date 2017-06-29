import React, {Component} from 'react';
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
        this._addMessage(data);
      }
    }
  }

  _onMessage(message) {
    this.socket.send(JSON.stringify(message));
  }

  _addMessage(message) {
    message.id = this.state.messages.length;
    this.setState({messages: this.state.messages.concat([message])});
  }

  render() {
    return (
      <div>
        <NavBar />
        <MessageList messages={this.state.messages}/>
        <ChatBar currentUser={this.state.currentUser} onMessage={this._onMessage.bind(this)} />
      </div>
    );
  }
}
export default App;
