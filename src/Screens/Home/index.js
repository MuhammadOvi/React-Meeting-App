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
import isLoggedIn from '../../Helper';
import firebase from '../../Config/firebase';
import {
  AcceptedDrawer,
  CancelledDrawer,
  DoneDrawer,
  PendingDrawer,
  RequestedDrawer,
  Notifications,
} from './Drawers';

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

    // Currently working in drawerAcceptedVisible
    this.state = {
      beverages: [],
      btnLoading: false,

      drawerAcceptedVisible: false, // done
      drawerCancelVisible: false,
      drawerDoneVisible: false,
      drawerNotificationsVisible: false,
      drawerPendingVisible: false, // done
      drawerRejectedVisible: false,
      drawerRequestedVisible: false,

      duration: [],

      meetingAccepted: [],
      meetingCancelled: [],
      meetingDone: [],
      meetingNotifications: [],
      meetingPending: [],
      meetingRejected: [],
      meetingRequested: [],

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

        if (status === 'completed') {
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

        this.checkMeetingsSetByMe();
        this.checkMeetingsSetForMe();
        this.checkNotifications();
      })
      .catch(err => {
        Message.error('Something Went Wrong! Try Again Later.');
        console.log('ERROR => ', err);
        this.logout();
        this.setState({ screenLoading: false });
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  checkMeetingsSetByMe = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });
    Meetings.where('setBy', '==', localStorage.getItem('uid')).onSnapshot(
      ({ docs }) => {
        // setting all the meetingsSetByMe in one place
        const meetingsSetByMe = docs.map(item => item.data());
        this.setState({ meetingsSetByMe, screenLoading: false });
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
        this.setState({ meetingsSetForMe, screenLoading: false });
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
        this.setState({ notifications, screenLoading: false });
      });
  };

  findMatch = () => {
    const { beverages } = this.state;
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

    this.setState({ btnLoading: false });
    if (matchingUsers.length > 0) {
      Message.info(`${matchingUsers.length} Match Found`);
      const { history } = this.props;
      history.push('/matching-users', { matchingUsers, myData });
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

  switchDrawer = drawerName => {
    const {
      drawerAcceptedVisible,
      drawerCancelVisible,
      drawerDoneVisible,
      drawerNotificationsVisible,
      drawerPendingVisible,
      drawerRejectedVisible,
      drawerRequestedVisible,
    } = this.state;

    switch (drawerName) {
      case 'ACCEPTED':
        if (!drawerAcceptedVisible) this.getAcceptedData();
        else this.setState({ drawerAcceptedVisible: !drawerAcceptedVisible });
        break;

      case 'CANCELLED':
        if (!drawerCancelVisible) this.getCancelledData();
        else this.setState({ drawerCancelVisible: !drawerCancelVisible });
        break;

      case 'DONE':
        if (!drawerDoneVisible) this.getDoneData();
        else this.setState({ drawerDoneVisible: !drawerDoneVisible });
        break;

      case 'NOTIFICATION':
        if (!drawerNotificationsVisible) this.getNotificationData();
        else
          this.setState({
            drawerNotificationsVisible: !drawerNotificationsVisible,
          });
        break;

      case 'PENDING':
        if (!drawerPendingVisible) this.getPendingData();
        else this.setState({ drawerPendingVisible: !drawerPendingVisible });
        break;

      case 'REJECTED':
        if (!drawerRejectedVisible) this.getRejectedData();
        else this.setState({ drawerRejectedVisible: !drawerRejectedVisible });
        break;

      case 'REQUESTED':
        if (!drawerRequestedVisible) this.getRequestedData();
        else this.setState({ drawerRequestedVisible: !drawerRequestedVisible });
        break;

      default:
        break;
    }
  };

  getPendingData = () => {
    this.setState({ screenLoading: true });

    const { meetingsSetForMe, myData } = this.state;
    const pendingMeetingsForMe = meetingsSetForMe.filter(
      elem => elem.status === 'pending' || elem.status === 'unseen',
    );

    const data = [];

    if (pendingMeetingsForMe.length > 0) {
      for (let i = 0; i < pendingMeetingsForMe.length; i++) {
        Users.doc(pendingMeetingsForMe[i].setBy)
          .get()
          .then(res => {
            const {
              name,
              userImages: [avatar],
            } = res.data();

            const setBy = {
              avatar,
              id: pendingMeetingsForMe[i].setBy,
              name,
            };

            const setWith = {
              avatar: myData.avatar,
              coords: myData.coords,
              id: localStorage.getItem('uid'),
              name: myData.name,
            };

            data.push({
              ...pendingMeetingsForMe[i],
              setBy,
              setWith,
            });
            if (i === pendingMeetingsForMe.length - 1)
              this.setState({
                drawerPendingVisible: true,
                meetingPending: data,
                screenLoading: false,
              });
          });
      }
    } else {
      this.setState({
        drawerPendingVisible: true,
        meetingPending: [],
        screenLoading: false,
      });
    }
  };

  getAcceptedData = () => {
    this.setState({ screenLoading: true });

    const { meetingsSetByMe, meetingsSetForMe, myData } = this.state;

    const acceptedMeetingsByMe = meetingsSetByMe.filter(
      elem => elem.status === 'accepted',
    );
    const acceptedMeetingsForMe = meetingsSetForMe.filter(
      elem => elem.status === 'accepted',
    );
    const acceptedMeetings = [
      ...acceptedMeetingsByMe,
      ...acceptedMeetingsForMe,
    ];

    const data = [];

    if (acceptedMeetings.length > 0) {
      for (let i = 0; i < acceptedMeetings.length; i++) {
        Users.doc(acceptedMeetings[i].setBy)
          .get()
          .then(res => {
            const {
              name,
              userImages: [avatar],
            } = res.data();

            const setBy = {
              avatar,
              id: acceptedMeetings[i].setBy,
              name,
            };

            const setWith = {
              avatar: myData.avatar,
              id: localStorage.getItem('uid'),
              name: myData.name,
            };

            data.push({
              ...acceptedMeetings[i],
              coords: myData.coords,
              setBy,
              setWith,
            });
            if (i === acceptedMeetings.length - 1)
              this.setState({
                drawerAcceptedVisible: true,
                meetingAccepted: data,
                screenLoading: false,
              });
          });
      }
    } else {
      this.setState({
        drawerAcceptedVisible: true,
        meetingAccepted: [],
        screenLoading: false,
      });
    }
  };

  cancelMeeting = meetingID => {
    const me = localStorage.getItem('uid');

    Meetings.doc(meetingID)
      .update({
        cancelledBy: me,
        notification: me,
        status: 'cancelled',
      })
      .then(() => Message.success('Meeting Cancelled'))
      .catch(err => Message.error(err.message));
  };

  render() {
    const {
      btnLoading,
      drawerPendingVisible,
      drawerCancelVisible,
      drawerAcceptedVisible,
      drawerDoneVisible,
      drawerRequestedVisible,
      drawerNotificationsVisible,

      meetingAccepted,
      meetingCancelled,
      meetingDone,
      meetingNotifications,
      meetingPending,
      meetingRequested,

      meetingsSetByMe,
      meetingsSetForMe,
      myData,
      myData: { avatar },
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

    // All meetings set by me
    const cancelledMeetingsByMe = meetingsSetByMe.filter(
      elem => elem.status === 'cancelled' || elem.status === 'rejected',
    );
    const acceptedMeetingsByMe = meetingsSetByMe.filter(
      elem => elem.status === 'accepted',
    );
    const doneMeetingsByMe = meetingsSetByMe.filter(
      elem => elem.status === 'done',
    );

    const requestedMeetings = meetingsSetByMe.filter(
      elem =>
        elem.setBy === localStorage.getItem('uid') &&
        (elem.status === 'pending' || elem.status === 'unseen'),
    );

    // All meetings set by other users
    const pendingMeetingsForMe = meetingsSetForMe.filter(
      elem => elem.status === 'pending' || elem.status === 'unseen',
    );
    const cancelledMeetingsForMe = meetingsSetForMe.filter(
      elem => elem.status === 'cancelled' || elem.status === 'rejected',
    );
    const acceptedMeetingsForMe = meetingsSetForMe.filter(
      elem => elem.status === 'accepted',
    );
    const doneMeetingsForMe = meetingsSetForMe.filter(
      elem => elem.status === 'done',
    );

    const pendingMeetings = pendingMeetingsForMe;
    const cancelledMeetings = [
      ...cancelledMeetingsByMe,
      ...cancelledMeetingsForMe,
    ];
    const acceptedMeetings = [
      ...acceptedMeetingsByMe,
      ...acceptedMeetingsForMe,
    ];
    const doneMeetings = [...doneMeetingsByMe, ...doneMeetingsForMe];

    const meetingSatus = [
      {
        desc: `${pendingMeetings.length} Meetings Request Pending`,
        id: 1,
        name: 'PENDING',
        title: 'PENDING REQUESTS',
      },
      {
        desc: `${cancelledMeetings.length} Meetings Cancelled`,
        id: 2,
        name: 'CANCELLED',
        title: 'CANCELLED REQUESTS',
      },
      {
        desc: `${acceptedMeetings.length} Meetings Accepted`,
        id: 3,
        name: 'ACCEPTED',
        title: 'ACCEPTED REQUESTS',
      },
      {
        desc: `${doneMeetings.length} Meetings Done`,
        id: 4,
        name: 'MEETINGS',
        title: 'MEETINGS DONE',
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
                      onClick={() => this.switchDrawer(item.name)}
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
        <AcceptedDrawer
          visible={drawerAcceptedVisible}
          close={this.switchDrawer}
          data={meetingAccepted}
        />
        <PendingDrawer
          visible={drawerPendingVisible}
          close={this.switchDrawer}
          data={meetingPending}
        />
        <CancelledDrawer
          visible={drawerCancelVisible}
          close={this.switchDrawer}
          data={cancelledMeetings}
          myData={myData}
        />
        <DoneDrawer
          visible={drawerDoneVisible}
          close={this.switchDrawer}
          data={doneMeetings}
          myData={myData}
        />
        <RequestedDrawer
          visible={drawerRequestedVisible}
          close={this.switchDrawer}
          data={requestedMeetings}
          myData={myData}
        />
        <Notifications
          visible={drawerNotificationsVisible}
          close={this.switchDrawer}
          data={notifications}
          myData={myData}
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
