import React, { Component } from 'react';
import styles from './styles.js'
import logo from './logo.svg';
import socketio from 'socket.io-client';
const socket = socketio.connect('http://localhost:4000');

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      chatList: [],
    }
  }

  componentDidMount(){
    socket.on('chatMsg', (obj) => {
      console.log(obj, '<< [ obj ]');
      const chatBackup = this.state.chatList;
      obj.key = 'key_' + (this.state.chatList.length + 1);
      chatBackup.unshift(obj);
      this.setState({chatList: chatBackup});
    })
  }

  render(){
    const messages = this.state.chatList.map(e => (
      <div key={e.key} style={styles.log}>
        <span style={styles.name}>{e.name}</span>
        <span style={styles.msg}>: {e.message}</span>
        <p style={{clear: 'both'}} />
      </div>
    ));

    return(
      <div>
        <h1 style={styles.h1}>실시간 채팅</h1>
        <ChatContent />
        <div>{messages}</div>
      </div>
    );
  }
}

class ChatContent extends Component {
  constructor(props){
    super(props);
    this.state = { name: '', message: '' };
  }
  nameChanged(e){
    this.setState({name: e.target.value});
  }
  messageChanged(e){
    this.setState({message: e.target.value});
  }
  
  send(){
    socket.emit('chatMsg', {
      name: this.state.name,
      message: this.state.message
    });
    this.setState({message: ''});
  }
  render(){
    return (
      <div style={styles.form}>
        이름:<br />
        <input value={this.state.name} onChange={e => this.nameChanged(e)} /><br />
        메시지:<br />
        <input value={this.state.message} onChange={e => this.messageChanged(e)} /><br />
        <button onClick={e => this.send()}>전송</button>
      </div>
    )
  }
}

export default App;
