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
  List,
  Badge,
} from 'antd';
import moment from 'moment-timezone';
import isLoggedIn from '../../Helper';
import firebase from '../../Config/firebase';

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

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      beverages: [],
      btnLoading: false,
      duration: [],

      meetingsSetByMe: [],
      meetingsSetForMe: [],

      myData: {},
      notifications: [],
      screenLoading: true,
    };
  }

  componentDidMount() {
    this.mounted = true;

    const { history } = this.props;
    isLoggedIn(history);

    const uid = localStorage.getItem('uid');

    if (!uid) return;
    Users.doc(uid)
      .get()
      .then(res => {
        const {
          name,
          status,
          beverages,
          duration,
          coords,
          userImages,
        } = res.data();

        // Checking User Status
        if (status === 'completed') {
          if (!this.mounted) return;
          this.setState({
            beverages,
            duration,
            myData: { avatar: userImages[0], coords, name },
            screenLoading: false,
          });
        } else {
          localStorage.setItem('status', status);
          if (!status) localStorage.setItem('status', 'step0');

          if (!status) history.push('/profile/step1');
          else if (status === 'step1') history.push('/profile/step2');
          else if (status === 'step2') history.push('/profile/step3');
          else if (status === 'step3') history.push('/profile/step4');
          else {
            Message.error('Something Went Wrong! Try Again Later.');
            this.logout();
          }
        }

        this.checkAll();
      })
      .catch(err => {
        Message.error('Something Went Wrong! Try Again Later.');
        console.log('ERROR => ', err);
        this.logout();
        if (this.mounted);
        this.setState({ screenLoading: false });
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  checkAll = () => {
    this.checkMeetingsSetByMe();
    this.checkMeetingsSetForMe();
  };

  checkMeetingsSetByMe = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });

    Meetings.where('setBy', '==', localStorage.getItem('uid')).onSnapshot(
      ({ docs }) => {
        // setting all the meetingsSetByMe in one place
        const meetingsSetByMe = docs.map(item => item.data());
        if (this.mounted);
        this.setState({ meetingsSetByMe, screenLoading: false }, () =>
          this.checkExpired(),
        );
      },
    );
  };

  checkMeetingsSetForMe = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });

    Meetings.where('setWith', '==', localStorage.getItem('uid')).onSnapshot(
      ({ docs }) => {
        // setting all the meetingsSetForMe in one place
        const meetingsSetForMe = docs.map(item => item.data());
        if (this.mounted);
        this.setState({ meetingsSetForMe, screenLoading: false }, () =>
          this.checkExpired(),
        );
      },
    );
  };

  checkNotifications = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });

    Meetings.where('status', '==', 'unseen')
      .where('setWith', '==', localStorage.getItem('uid'))
      .onSnapshot(({ docs }) => {
        const notifications = docs.map(item => item.data());
        if (this.mounted);
        this.setState({ notifications, screenLoading: false }, () =>
          this.checkExpired(),
        );
      });
  };

  checkExpired = () => {
    const { meetingsSetByMe, meetingsSetForMe } = this.state;
    const data = [...meetingsSetByMe, ...meetingsSetForMe];

    const dbPromises = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (
        item.status !== 'cancelled' &&
        item.status !== 'rejected' &&
        item.status !== 'expired' &&
        (item.expired && item.expired !== 'accepted')
      ) {
        const dateTime = moment(
          `${item.date} ${item.time}`,
          'DD-MM-YYYY hh:mm A',
        ).format();
        const expired = moment(dateTime).isBefore();
        if (expired)
          dbPromises.push(
            Meetings.doc(item.id)
              .update({
                expired: 'accepted',
                status: 'expired',
                updated: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .catch(err => Message.error(err.message)),
          );
      }
    }

    if (dbPromises.length > 0) {
      Promise.all(dbPromises).catch(err => {
        console.log('err->', err);
      });
    }
  };

  // Find bevarages matching users
  findMatch = () => {
    const { beverages } = this.state;
    if (!this.mounted) return;
    this.setState({ btnLoading: true });

    // Checking for beverages matches...
    let beveragesMatchingUsers = [];
    beverages.map((beverage, index) =>
      Users.where('beverages', 'array-contains', beverage)
        .where('status', '==', 'completed')
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

  // Filter users that matches duration of meeting
  filterDuration = beveragesMatchingUsers => {
    const { duration, myData } = this.state;

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

    if (!this.mounted) return;
    this.setState({ btnLoading: false });
    if (matchingUsers.length > 0) {
      Message.info(`${matchingUsers.length} Match Found`);
      const { history } = this.props;
      history.push('/matching-users', { matchingUsers, myData });
    } else Message.info('No Match Found');
  };

  // remove all duplicate users
  removeDuplicates = (myArr, prop) =>
    myArr.filter(
      (obj, pos, arr) =>
        arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos,
    );

  // logout
  logout = () => {
    const { history } = this.props;
    if (!this.mounted) return;
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
        if (!this.mounted) return;
        this.setState({ screenLoading: false });
      });
  };

  // just for development
  devReData = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });
    Users.doc(localStorage.getItem('uid'))
      .update({ status: '' })
      .then(() => {
        if (!this.mounted) return;
        this.setState({ screenLoading: false });
        window.location.reload();
      });
  };

  // go to specific meeting page
  switchPage = pageName => {
    const { history } = this.props;

    switch (pageName) {
      case 'ACCEPTED':
        history.push('/meetings/accepted');
        break;
      case 'CANCELLED':
        history.push('/meetings/cancelled');
        break;
      case 'DONE':
        history.push('/meetings/done');
        break;
      case 'EXPIRED':
        history.push('/meetings/expired');
        break;
      case 'PENDING':
        history.push('/meetings/pending');
        break;
      case 'REQUESTED':
        history.push('/meetings/requested');
        break;
      case 'NOTIFICATION':
        history.push('/meetings/notification');
        break;
      default:
        break;
    }
  };

  render() {
    const {
      btnLoading,
      meetingsSetByMe,
      meetingsSetForMe,
      notifications,
      screenLoading,
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
          App v0.10
        </Menu.Item>
      </Menu>
    );

    const allMeetings = [...meetingsSetByMe, ...meetingsSetForMe];

    const acceptedMeetings = allMeetings.filter(
      elem => elem.status === 'accepted',
    );
    const cancelledMeetings = allMeetings.filter(
      elem => elem.status === 'cancelled' || elem.status === 'rejected',
    );
    const doneMeetings = allMeetings.filter(
      elem => elem.status === 'expired' && elem.expired === 'accepted',
    );

    const expiredMeetings = allMeetings.filter(
      elem => elem.status === 'expired' && elem.expired === 'pending',
    );

    const pendingMeetings = allMeetings.filter(
      elem =>
        elem.setWith === localStorage.getItem('uid') &&
        (elem.status === 'pending' || elem.status === 'unseen'),
    );

    const requestedMeetings = allMeetings.filter(
      elem =>
        elem.setBy === localStorage.getItem('uid') &&
        (elem.status === 'pending' || elem.status === 'unseen'),
    );

    const meetingSatus = [
      {
        desc: `${acceptedMeetings.length} Meetings Accepted`,
        id: 1,
        name: 'ACCEPTED',
        title: 'ACCEPTED REQUESTS',
      },
      {
        desc: `${cancelledMeetings.length} Meetings Cancelled`,
        id: 2,
        name: 'CANCELLED',
        title: 'CANCELLED REQUESTS',
      },
      {
        desc: `${doneMeetings.length} Meetings Done`,
        id: 3,
        name: 'DONE',
        title: 'MEETINGS DONE',
      },
      {
        desc: `${expiredMeetings.length} Meetings Expired`,
        id: 4,
        name: 'EXPIRED',
        title: 'MEETINGS EXPIRED',
      },
      {
        desc: `${pendingMeetings.length} Meetings Request Pending`,
        id: 5,
        name: 'PENDING',
        title: 'PENDING REQUESTS',
      },
      {
        desc: `${requestedMeetings.length} Requested Meetings`,
        id: 5,
        name: 'REQUESTED',
        title: 'REQUESTED BY ME',
      },
    ];

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
        {meetingsSetByMe.length === 0 && meetingsSetForMe.length === 0 ? (
          <div>
            <h1>You have not set or done any meeting yet!</h1>
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
            {notifications.length > 0 && (
              <Col span={24} style={{ margin: '10px 0', textAlign: 'center' }}>
                <Badge count={notifications.length}>
                  <Button
                    style={{ fontSize: '2em', height: 50, width: 50 }}
                    icon="bell"
                    size="large"
                    onClick={() => this.switchDrawer('NOTIFICATION')}
                  />
                </Badge>
                <p>You have some new meeting requests!</p>
              </Col>
            )}
            <Col span={24} style={{ textAlign: 'left' }}>
              <List
                dataSource={meetingSatus}
                renderItem={item => (
                  <List.Item key={item.id} style={{ padding: 10 }}>
                    <List.Item.Meta
                      title={item.title}
                      description={item.desc}
                    />
                    <Button
                      onClick={() => this.switchPage(item.name)}
                      type="primary"
                    >
                      View
                    </Button>
                  </List.Item>
                )}
              />
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
