import React, {Component} from 'react';
import Message from './Message.jsx'
class MessageList extends Component {
  render() {
    const messages = this.props.messages.map(function(message) {
      console.log(message);
      return <Message type={message.type} key={message.id}
        username={message.username}
        content={message.content}
        color={message.color} />
    });

    return (
      <main className="messages">
        {messages}
      </main>
    );
  }
}
export default MessageList;
