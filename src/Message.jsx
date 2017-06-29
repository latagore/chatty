import React, {Component} from 'react';

class NavBar extends Component {
  render() {
    if (this.props.type === "incomingNotification") {
      return (
          <div className="message system">
            <span className="message-content">{this.props.content}</span>
          </div>
      );
    } else {
      return (
          <div className="message">
            <span className="message-username">{this.props.username}</span>
            <span className="message-content">{this.props.content}</span>
          </div>
      );
    }
  }
}
export default NavBar;
