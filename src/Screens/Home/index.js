// Home
import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import { message as Message, Icon, Button, Menu, Dropdown } from 'antd';
import isLoggedIn from '../../Helper';
import firebase from '../../Config/firebase';
import UserCard from '../../Component/UserCard';

const Users = firebase.firestore().collection('Users');

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      beverages: [],
      btnLoading: false,
      duration: [],
      matchingUsers: [],
      screenLoading: true,
    };
  }

  componentDidMount() {
    const { history } = this.props;
    isLoggedIn(history);

    const uid = localStorage.getItem('uid');

    if (!uid) return;
    Users.doc(uid)
      .get()
      .then(res => {
        const { status, beverages, duration, coords } = res.data();
        this.setState({ beverages, duration, screenLoading: false });
        localStorage.setItem('coords', JSON.stringify(coords));

        if (status !== 'completed') {
          localStorage.setItem('status', status);
          if (!status) localStorage.setItem('status', 'step0');

          if (!status) history.push('/profile/step1');
          else if (status === 'step1') history.push('/profile/step2');
          else if (status === 'step2') history.push('/profile/step3');
          else if (status === 'step3') history.push('/profile/step4');
        }
      })
      .catch(err => {
        Message.error('Something Went Wrong! See console for log.');
        console.log('ERROR => ', err);
        this.setState({ screenLoading: false });
      });
  }

  findMatch = () => {
    const { beverages } = this.state;
    this.setState({ btnLoading: true });

    // Checking for beverages matches...
    let beveragesMatchingUsers = [];
    beverages.map((beverage, index) =>
      Users.where('beverages', 'array-contains', beverage)
        .get()
        .then(response => {
          if (!response.empty) {
            const newData = response.docs.map(data => data.data());

            beveragesMatchingUsers = [...beveragesMatchingUsers, ...newData];

            if (index === beverages.length - 1) {
              console.log('beforeFilterDuration', beveragesMatchingUsers);
              this.filterDuration(
                this.removeDuplicates(beveragesMatchingUsers, 'uid'),
              );
            }
          }
        }),
    );
  };

  filterDuration = beveragesMatchingUsers => {
    const { duration } = this.state;
    let { matchingUsers } = this.state;

    for (let i = 0; i < duration.length; i++) {
      const newData = beveragesMatchingUsers.filter(
        user =>
          user.duration.includes(duration[i]) &&
          user.uid !== localStorage.getItem('uid'),
      );
      matchingUsers = [...matchingUsers, ...newData];
    }

    // // Same achievement with MAP
    // duration.map(singleDuration => {
    //   const newData = beveragesMatchingUsers.filter(
    //     user =>
    //       user.duration.includes(singleDuration) &&
    //       user.uid !== localStorage.getItem('uid'),
    //   );
    //   matchingUsers = [...matchingUsers, ...newData];
    // });

    this.setState({ btnLoading: false, matchingUsers });
    if (matchingUsers.length > 0) {
      Message.info(`${matchingUsers.length} Match Found`);
      // console.clear();
    } else Message.info('No Match Found');
  };

  removeDuplicates = (myArr, prop) =>
    myArr.filter(
      (obj, pos, arr) =>
        arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos,
    );

  logout = () => {
    const { history } = this.props;

    this.setState({ screenLoading: true });

    firebase
      .auth()
      .signOut()
      .then(() => {
        localStorage.clear();
        history.push('/');
      })
      .catch(err => {
        Message.error('Something Went Wrong! See console for log.');
        console.log('ERROR => ', err);
        this.setState({ screenLoading: false });
      });
  };

  devReData = () => {
    this.setState({ screenLoading: true });
    Users.doc(localStorage.getItem('uid'))
      .update({ status: '' })
      .then(() => {
        this.setState({ screenLoading: false });
        window.location.reload();
      });
  };

  render() {
    const { screenLoading, btnLoading, matchingUsers } = this.state;
    console.log(matchingUsers, 'matchingUsers');
    const { history } = this.props;

    const menu = (
      <Menu>
        <Menu.Item key="0" disabled>
          My Profile
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="1" onClick={this.logout}>
          Logout
        </Menu.Item>
        <Menu.Item key="2" onClick={this.devReData}>
          Reset Profile (Dev.)
        </Menu.Item>
        <Menu.Item key="3" disabled>
          App v0.01
        </Menu.Item>
      </Menu>
    );

    return (
      <div className="home">
        {screenLoading && (
          <div className="loading">
            <Icon type="loading" />
          </div>
        )}
        <Dropdown overlay={menu} trigger={['click']}>
          <span className="ant-dropdown-link">
            <Icon type="ellipsis" theme="outlined" />
          </span>
        </Dropdown>
        {matchingUsers.length === 0 ? (
          <div>
            <h1>You have not done any meeting yet!</h1>
            <p>
              Start one by tapping{' '}
              <Icon
                style={{
                  background: '#FF4081',
                  borderRadius: 100,
                  color: '#FFF',
                  padding: 3,
                }}
                type="plus"
              />
            </p>
            <Button
              loading={btnLoading}
              style={{
                background: '#C2185B',
                borderColor: '#C2185B',
                bottom: '30px',
                fontSize: '2em',
                height: '50px',
                position: 'fixed',
                right: '30px',
                width: '50px',
              }}
              type="primary"
              shape="circle"
              icon="plus"
              onClick={this.findMatch}
            />
          </div>
        ) : (
          <UserCard matchingUsers={matchingUsers} history={history} />
        )}
      </div>
    );
  }
}

Home.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired,
};
export default Home;
/* eslint no-loop-func: 0 */
