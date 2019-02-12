import React, { Component } from 'react';
import './App.css';
import firebase from "firebase/app";

class App extends Component {

  state = {
    messageInput: "",
    userName: "",
    userEmail: "",
    userPass: "",
    userSignInEmail: "",
    userSignInPass: "",
    messages: [],
    users: [],
    currentUser: {},
    chatBoxes: {}
  }

  handleChange = (ev) => {
    this.setState({
      [ev.target.name]: ev.target.value
    })
  }

  handleSignUp = (ev) => {
    ev.preventDefault();

    firebase.auth().createUserWithEmailAndPassword(this.state.userEmail, this.state.userPass)
      .then(snap => {

        let userUid = snap.user.uid;
        let userName = this.state.userName;
        let userEmail = snap.user.email;
        let isActive = false;

        let userData = { userUid, userName, userEmail, isActive }

        firebase.database().ref(`users/${userUid}`).set(userData)
          .then(() => {

            this.setState({
              userName: "",
              userEmail: "",
              userPass: ""
            })

            console.log("Success: Data Set Successful!")
          })
          .catch(() => {
            console.log("Error: Data Set Unsuccessful!")
          })
      })
      .catch(error => {
        console.log(error)
      })
  }

  handleSignIn = (ev) => {
    ev.preventDefault();

    firebase.auth().signInWithEmailAndPassword(this.state.userSignInEmail, this.state.userSignInPass)
      .then(snap => {
        this.setState({
          userSignInEmail: "",
          userSignInPass: ""
        })
      })
      .catch(error => {
        console.log(error)
      })
  }

  componentDidMount() {

    firebase.database().ref('/').on("value", snap => {
      let data = snap.val() === null ? {} : snap.val()

      let users = data.users ? Object.values(data.users) : [];
      let messages = data.messages ? Object.values(data.messages) : [];
      this.setState({ users, messages })

      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          firebase.database().ref(`users/${user.uid}/isActive`).set(true)
            .then(() => {
              let currentUser = this.state.users.filter(x => x.userUid === user.uid);
              this.setState({ currentUser: currentUser[0] })
            })
        }
        else {
          this.setState({ currentUser: {} })
        }
      })
    })
  }

  handleSubmit = (data, ev) => {

    ev.preventDefault();

    let details = {
      senderId: this.state.currentUser.userUid,
      receiverId: data.userUid,
      message: this.state.messageInput,
      senderName: this.state.currentUser.userName
    }

    firebase.database().ref("messages").push(details)
      .then(snap => {
        this.setState({
          messageInput: ""
        })
      })
      .catch(error => {
        console.log(error);
      })
  }

  handleOpenChat = (u) => {
    
    if(!this.state.chatBoxes.hasOwnProperty(u.userUid)) {
      this.setState(prevState => ({
        chatBoxes: {...prevState.chatBoxes, [u.userUid]: u}
      }))
    }
    
  }

  handleChatBoxClose = (id) => {
    let list = this.state.chatBoxes;
    delete list[id.userUid];

    this.setState({
      chatBoxes: list
    })
  }

  insertChatBox = (data) => {

    let { messages } = this.state;

    let messagesList = messages.filter( message => ((message.senderId === data.userUid && message.receiverId === this.state.currentUser.userUid) || (message.senderId === this.state.currentUser.userUid && message.receiverId === data.userUid)));

    return (
      <div id="content" key={data.userUid}>

        <h3>Chat started with: {data.userName}</h3>

        <hr />

        <form onSubmit={(ev) => this.handleSubmit(data, ev)}>
          <label htmlFor="messageInput">Message: </label>
          <input type="text" id="messageInput" name="messageInput" value={this.state.messageInput} onChange={this.handleChange} />

          <button type="submit">Send</button>
        </form>

        <h4>Messages:</h4>

        <div>
          <ul>
            {
              messagesList.map((message, i) => {
                return (
                  <li key={i}>{`${message.message} <== ${message.senderName === this.state.currentUser.userName ? "You" : message.senderName}`}</li>
                )
              })
            }
          </ul>
        </div>

        <button onClick={() => this.handleChatBoxClose(data)}>Close Chat Box</button>
      </div>
    )
  }

  handleLogOut = () => {
    firebase.auth().signOut()
      .then(() => {
        firebase.database().ref(`users/${this.state.currentUser.userUid}/isActive`).set(false)
      })
  }

  render() {

    let users = [];

    if (Object.entries(this.state.currentUser).length !== 0) {
      users = this.state.users.filter(user => user.userUid !== this.state.currentUser.userUid);
    }

    let chatBoxes = Object.values(this.state.chatBoxes);

    return (
      <div className="App">

        {
          Object.entries(this.state.currentUser).length !== 0 ? (
            <div>
              <h3>Current User: {this.state.currentUser.userName}</h3>
              <button onClick={this.handleLogOut}>Log Out</button>
            </div>
          ) : "Please Sign In"
        }

        <hr />

        <ul>
          {
            users.map((user) => {
              return (
                <li key={user.userUid} onClick={() => this.handleOpenChat(user)}>{`${user.userName} (${user.isActive ? "Online" : "Offline"})`}</li>
              )
            })
          }
        </ul>

        <hr />

        <form id="sign-up-form" onSubmit={this.handleSignUp}>
          <label htmlFor="userName">Name: </label>
          <input type="text" id="userName" name="userName" value={this.state.userName} onChange={this.handleChange} />

          <br />

          <label htmlFor="userEmail">Email: </label>
          <input type="text" id="userEmail" name="userEmail" value={this.state.userEmail} onChange={this.handleChange} />

          <br />

          <label htmlFor="userPass">Password: </label>
          <input type="password" id="userPass" name="userPass" value={this.state.userPass} onChange={this.handleChange} />

          <button type="submit" className="submit-btn">Sign Up</button>
        </form>

        <hr />

        <form id="sign-in-form" onSubmit={this.handleSignIn}>

          <label htmlFor="userSignInEmail">Email: </label>
          <input type="text" id="userSignInEmail" name="userSignInEmail" value={this.state.userSignInEmail} onChange={this.handleChange} />

          <br />

          <label htmlFor="userSignInPass">Password: </label>
          <input type="password" id="userSignInPass" name="userSignInPass" value={this.state.userSignInPass} onChange={this.handleChange} />

          <button type="submit" className="submit-btn">Sign In</button>
        </form>

        <hr />

        {
          Object.values(chatBoxes).map((chatBox, i) => this.insertChatBox(chatBox, i))
        }

      </div>
    );
  }
}

export default App;
