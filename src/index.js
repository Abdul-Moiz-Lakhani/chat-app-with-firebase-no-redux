import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import * as firebase from 'firebase';

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAv71-5itSOzD_bYlMA7am1tK5PW2hmIVs",
    authDomain: "amlakhani-chatapp.firebaseapp.com",
    databaseURL: "https://amlakhani-chatapp.firebaseio.com",
    projectId: "amlakhani-chatapp",
    storageBucket: "amlakhani-chatapp.appspot.com",
    messagingSenderId: "451241892358"
};
firebase.initializeApp(config);

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
