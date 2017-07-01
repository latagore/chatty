import React, {Component} from 'react';


// adapted from https://stackoverflow.com/a/5717133
const pattern = new RegExp('(https?:\/\/)?'+ // protocol
  '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
  '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
  '(\:\d+)?(\/[-a-z\\d%_.~+]*)*'+ // port and path
  '/[^/]+\.(png|jpg|gif|jpeg)'
  , 'i');
function getImageURL(str) {
   const matches = str.match(pattern);
   if (matches) {
     return matches[0];
   }
}

class Message extends Component {
  render() {
    if (this.props.type === "incomingNotification") {
      return (
          <div className="message system">
            <span className="message-content">{this.props.content}</span>
          </div>
      );
    } else {
      const url = getImageURL(this.props.content);
      let image;
      if (url) {
        image = <img src={url} />
      }
      return (
          <div className="message">
            <span className="message-username" style={{color: this.props.color}}>{this.props.username}</span>
            <span className="message-content">
              <div>{this.props.content}</div>
              {image}
            </span>
          </div>
      );
    }
  }
}
export default Message;
