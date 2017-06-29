import React, {Component} from 'react';

class ChatBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameValue: props.currentUser.name,
      messageValue: ''
    }
  }

  onMessageKeyDown(event) {
    const ENTER = 13;
    if (event.keyCode === ENTER) {
      this.props.onMessage({ username: this.state.usernameValue, content: this.state.messageValue});
      this.setState({messageValue: ''});
    }
  }

  _onUsernameChange(event) {
    this.setState({usernameValue: event.target.value});
  }

  _onMessageChange(event) {
    this.setState({messageValue: event.target.value});
  }

  render() {
    return (
      <footer className="chatbar">
        <input className="chatbar-username" placeholder="Your Name (Optional)" onChange={this._onUsernameChange.bind(this)} value={this.state.usernameValue} />
        <input className="chatbar-message" placeholder="Type a message and hit ENTER" onKeyDown={this.onMessageKeyDown.bind(this)} onChange={this._onMessageChange.bind(this)} value={this.state.messageValue}/>
      </footer>
    );
  }
}
export default ChatBar;
