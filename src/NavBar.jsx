import React, {Component} from 'react';

class NavBar extends Component {
  render() {
    let userOnlineEl;
    if (!isNaN(this.props.usersOnline)) {
      if (this.props.usersOnline === 1) {
        userOnlineEl = <span key="users-online" className="navbar-users-online">{this.props.usersOnline} user online</span>
      } else {
        userOnlineEl = <span key="users-online" className="navbar-users-online">{this.props.usersOnline} users online</span>
      }
    }
    return (
      <nav className="navbar">
        <a key="brand" href="/" className="navbar-brand">Chatty</a>
        {userOnlineEl}
      </nav>
    );
  }
}
export default NavBar;
