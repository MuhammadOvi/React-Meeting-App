// Login
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.css';
import { Icon, message as Message } from 'antd';
import { connect } from 'react-redux';
import { updateUser as UpdateUser } from '../../Redux/Actions';
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

    const { history, updateUser, user: User } = this.props;
    isLoggedIn(history, User);

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        Users.doc(user.uid)
          .set(
            { email: user.email || '', name: user.displayName, uid: user.uid },
            { merge: true },
          )
          .then(() => {
            updateUser({ name: user.displayName, uid: user.uid });
            history.push('/home');
          })
          .catch(err => {
            Message.error('Something Went Wrong! See console for log.');
            console.log('ERROR 01 => ', err);
          });
      }
      if (!user && this.mounted) {
        this.setState({ disabled: false });
        updateUser({});
      }
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  loginUser = () => {
    const { updateUser } = this.props;
    this.setState({ disabled: true });

    firebase
      .auth()
      .signInWithPopup(provider)
      .then(result => {
        const { user } = result;
        // const token = result.credential.accessToken;
        updateUser({ name: user.displayName, uid: user.uid });
        // setTimeout(() => {
        //   if (this.mounted) this.setState({ disabled: false });
        // }, 5000);
      })
      .catch(err => {
        if (err.code === 'auth/network-request-failed')
          Message.error('No Internet or Network Error');
        else Message.error('Something Went Wrong! See console for log.');
        console.log('ERROR 02 => ', err);
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
  updateUser: PropTypes.func.isRequired,
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  user: state.authReducers.user,
});

const mapDispatchToProps = dispatch => ({
  updateUser: user => dispatch(UpdateUser(user)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login);
