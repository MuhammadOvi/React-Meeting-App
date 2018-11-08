// Home
import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import {
  message as Message,
  Icon,
  Button,
  Menu,
  Dropdown,
  Row,
  Col,
} from 'antd';
import isLoggedIn from '../../Helper';
import firebase from '../../Config/firebase';
import PendingDrawer from './PendingDrawer';

const Users = firebase.firestore().collection('Users');
const Meetings = firebase.firestore().collection('Meetings');

const addMeetingBtn = {
  background: '#C2185B',
  borderColor: '#C2185B',
  bottom: '30px',
  fontSize: '2em',
  height: '50px',
  position: 'fixed',
  right: '30px',
  width: '50px',
  zIndex: 2,
};

const meetingCatBtn = {
  alignItems: 'center',
  borderRadius: 5,
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 10,
  minHeight: 100,
};

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      beverages: [],
      btnLoading: false,
      duration: [],
      meetings: [],
      screenLoading: true,
      drawerPendingVisible: false,
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

        this.checkMeetings();
      })
      .catch(err => {
        Message.error('Something Went Wrong! See console for log.');
        console.log('ERROR => ', err);
        this.setState({ screenLoading: false });
      });
  }

  checkMeetings = () => {
    this.setState({ screenLoading: true });
    Meetings.where('setBy', '==', localStorage.getItem('uid'))
      .get()
      .then(({ docs }) => {
        // setting all the meetings in one place
        const meetings = docs.map(item => item.data());
        this.setState({ meetings, screenLoading: false });
      });
  };

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

    let matchingUsers = [];

    for (let i = 0; i < duration.length; i++) {
      const newData = beveragesMatchingUsers.filter(
        user =>
          user.duration.includes(duration[i]) &&
          user.uid !== localStorage.getItem('uid'),
      );
      matchingUsers = [...matchingUsers, ...newData];
    }

    matchingUsers = this.removeDuplicates(matchingUsers, 'uid');

    this.setState({ btnLoading: false });
    if (matchingUsers.length > 0) {
      Message.info(`${matchingUsers.length} Match Found`);
      const { history } = this.props;
      history.push('/matching-users', { matchingUsers });
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

  closeDrawer = drawerName => {
    switch (drawerName) {
      case 'PendingDrawer':
        this.setState({ drawerPendingVisible: false });
        break;

      default:
        break;
    }
  };

  render() {
    const {
      screenLoading,
      btnLoading,
      meetings,
      drawerPendingVisible,
    } = this.state;

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
        {meetings.length === 0 ? (
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
          </div>
        ) : (
          <Row
            gutter={8}
            style={{
              height: '100%',
              padding: 5,
              width: '100%',
            }}
          >
            <Col span={24} style={{ textAlign: 'center' }}>
              <h2>Meetings!</h2>
            </Col>
            <Col span={12}>
              <div style={meetingCatBtn}>
                <Button
                  onClick={() => {
                    this.setState({
                      drawerPendingVisible: !drawerPendingVisible,
                    });
                  }}
                  style={{ width: '80%' }}
                  type="primary"
                  size="large"
                >
                  PENDING
                </Button>
                <PendingDrawer
                  visible={drawerPendingVisible}
                  close={this.closeDrawer}
                  data={meetings}
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={meetingCatBtn}>
                <Button style={{ width: '80%' }} type="primary" size="large">
                  CANCELLED
                </Button>
              </div>
            </Col>
            <Col span={12}>
              <div style={meetingCatBtn}>
                <Button style={{ width: '80%' }} type="primary" size="large">
                  ACCEPTED
                </Button>
              </div>
            </Col>
            <Col span={12}>
              <div style={meetingCatBtn}>
                <Button style={{ width: '80%' }} type="primary" size="large">
                  DONE
                </Button>
              </div>
            </Col>
          </Row>
        )}
        <Button
          loading={btnLoading}
          style={addMeetingBtn}
          type="primary"
          shape="circle"
          icon="plus"
          onClick={this.findMatch}
        />
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
