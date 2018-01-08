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
      chatChannel: '1',
    };
    this.chatListUpdate = this.chatListUpdate.bind(this);
    this.channelUpdate = this.channelUpdate.bind(this);
  }

  componentDidMount(){
    //this.chatLoad(this.state.chatChannel);

    const roomId = this.state.chatChannel;
    console.log(roomId, '<< [ roomId ]');
    socket.emit('join', {id: roomId});

    socket.on('chatMsg', (obj) => {
      this.chatListUpdate(obj);
    })

    socket.on('connectUser', obj => {
      this.chatListUpdate({name: 'DEBUG', message: `[${obj.id}, Join]`});
    })

    socket.on('disconnectUser', obj => {
      this.chatListUpdate({name: 'DEBUG', message: `[${obj.id}, Leave]`});
    })
  }

  chatListUpdate(param){
    const chatBackup = this.state.chatList;
    param.key = 'key_' + (this.state.chatList.length + 1);
    chatBackup.unshift(param);
    this.setState({chatList: chatBackup});
  }

  channelUpdate(param){
    this.setState({
      chatChannel: param.id,
    });
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
        <ChatContent chatChannel={this.state.chatChannel} chatListUpdate={this.chatListUpdate} channelUpdate={this.channelUpdate} />
        <div>{messages}</div>
      </div>
    );
  }
}

class ChatContent extends Component {
  constructor(props){
    super(props);
    this.state = { name: '', message: '', chatChannel: this.props.chatChannel };
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.chatChannel !== prevProps.chatChannel){
      this.setState({
        chatChannel: this.props.chatChannel,
      })
    }
  }

  nameChanged(e){
    this.setState({name: e.target.value});
  }
  messageChanged(e){
    this.setState({message: e.target.value});
  }

  handleChatEnt(e){
    if (e.keyCode === 13 && e.target.value) {
      this.send();
    }
  }

  handleChannel(e){
    console.log(this.state.chatChannel, '<< [ this.v.chatChannel ]');
    //this.props.chatLoad(e.target.value);
    const param = {
      id: e.target.value,
      name: 'SYSTEM',
      message: e.target.value === '0' ? `< 글로벌 채널 >` : `#Ch${e.target.value} 채널로 이동했습니다.`,
    };

    this.props.channelUpdate(param);
    this.props.chatListUpdate(param);
    socket.emit('join', {id: e.target.value});
  }
  
  send(){
    const param = {
      name: this.state.name,
      message: this.state.message
    };

    if(this.state.chatChannel !== '0'){
      this.props.chatListUpdate(param);
    }
    socket.emit('chatMsg', param);
    this.setState({message: ''});
  }

  render(){
    return (
      <div style={styles.form}>
        채널:<br />
        <div onChange={this.handleChannel.bind(this)}>
          <input type="radio" id="chatCh0" name="chatChannel" value="0" checked={this.state.chatChannel === '0'} />
          <label htmlFor="chatCh0">#Global</label>
          <input type="radio" id="chatCh1" name="chatChannel" value="1" checked={this.state.chatChannel === '1'} />
          <label htmlFor="chatCh1">#Ch1</label>
          <input type="radio" id="chatCh2" name="chatChannel" value="2" checked={this.state.chatChannel === '2'} />
          <label htmlFor="chatCh2">#Ch2</label>
          <input type="radio" id="chatCh3" name="chatChannel" value="3" checked={this.state.chatChannel === '3'} />
          <label htmlFor="chatCh3">#Ch3</label>
        </div>
        <br />
        이름:<br />
        <input value={this.state.name} onChange={e => this.nameChanged(e)} /><br />
        메시지:<br />
        <input value={this.state.message} onChange={e => this.messageChanged(e)} onKeyDown={e => this.handleChatEnt(e)} /><br />
        <button onClick={e => this.send()}>전송</button>
      </div>
    )
  }
}

export default App;
