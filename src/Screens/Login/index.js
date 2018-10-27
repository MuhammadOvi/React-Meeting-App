// Login
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.css';
import { Icon, message as Message } from 'antd';
import logo from '../../sources/img/logo.png';
import isLoggedIn from '../../Helper';
import firebase from '../../Config/firebase';

const provider = new firebase.auth.FacebookAuthProvider();
const Users = firebase.firestore().collection('Users');

class Login extends Component {
  constructor() {
    super();

    this.state = {
      disabled: true,
    };
  }

  componentDidMount() {
    this.mounted = true;

    const { history } = this.props;
    isLoggedIn(history);

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        Users.doc(user.uid)
          .set(
            { email: user.email || '', name: user.displayName, uid: user.uid },
            { merge: true },
          )
          .then(() => {
            localStorage.setItem('uid', user.uid);
            history.push('/home');
          })
          .catch(err => {
            Message.error('Something Went Wrong! See console for log.');
            console.log('ERROR => ', err);
          });
      }
      if (!user && this.mounted) {
        this.setState({ disabled: false });
      }
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  loginUser = () => {
    this.setState({ disabled: true });

    firebase
      .auth()
      .signInWithPopup(provider)
      .then(result => {
        const { user } = result;
        localStorage.setItem('uid', user.uid);
        localStorage.setItem('name', user.displayName);
        // const token = result.credential.accessToken;
        setTimeout(() => {
          if (this.mounted) this.setState({ disabled: false });
        }, 5000);
      })
      .catch(err => {
        Message.error('Something Went Wrong! See console for log.');
        console.log('ERROR => ', err);
        this.setState({ disabled: false });
      });
  };

  render() {
    const { disabled } = this.state;

    return (
      <div className="section">
        <header className="login-screen-header">
          <div className="login-screen-bg-overlay" />
          <div className="login-screen-header-logo">
            <img src={logo} alt="Logo" />
            <h2>MeetLo</h2>
          </div>
        </header>
        <section className="login-screen-section">
          <div>
            <button
              type="button"
              disabled={disabled}
              className="loginBtn--facebook"
              onClick={this.loginUser}
            >
              Login with Facebook &nbsp;
              {disabled && <Icon type="loading" theme="outlined" />}
            </button>
            <p>tapping log in agrees our terms</p>
          </div>
        </section>
      </div>
    );
  }
}

Login.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired,
};

export default Login;
