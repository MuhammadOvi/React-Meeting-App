import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyBXVahY8_JjjYGgdCnhoJV7IjtXx29-Hbk',
  authDomain: 'saylani2511.firebaseapp.com',
  databaseURL: 'https://saylani2511.firebaseio.com',
  messagingSenderId: '81323254339',
  projectId: 'saylani2511',
  storageBucket: 'saylani2511.appspot.com',
};
firebase.initializeApp(config);

const firestore = firebase.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

export default firebase;
