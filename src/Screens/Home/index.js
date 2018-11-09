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

    this.state = {
      beverages: [],
      btnLoading: false,
      drawerAcceptedVisible: false,
      drawerCancelVisible: false,
      drawerDoneVisible: false,
      drawerNotificationsVisible: false,
      drawerPendingVisible: false,
      drawerRequestedVisible: false,
      duration: [],
      meetings: [],
      myAvatar: '',
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
        const { status, beverages, duration, coords, userImages } = res.data();
        this.setState({
          beverages,
          duration,
          myAvatar: userImages[0],
          screenLoading: false,
        });
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
    Meetings.where('setBy', '==', localStorage.getItem('uid')).onSnapshot(
      ({ docs }) => {
        // setting all the meetings in one place
        const meetings = docs.map(item => item.data());
        this.setState({ meetings, screenLoading: false });
      },
    );
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

  switchDrawer = drawerName => {
    const {
      drawerPendingVisible,
      drawerCancelVisible,
      drawerAcceptedVisible,
      drawerDoneVisible,
      drawerRequestedVisible,
      drawerNotificationsVisible,
    } = this.state;

    switch (drawerName) {
      case 'PENDING':
        this.setState({ drawerPendingVisible: !drawerPendingVisible });
        break;
      case 'CANCELLED':
        this.setState({ drawerCancelVisible: !drawerCancelVisible });
        break;
      case 'ACCEPTED':
        this.setState({ drawerAcceptedVisible: !drawerAcceptedVisible });
        break;
      case 'DONE':
        this.setState({ drawerDoneVisible: !drawerDoneVisible });
        break;
      case 'REQUESTED':
        this.setState({ drawerRequestedVisible: !drawerRequestedVisible });
        break;
      case 'NOTIFICATION':
        this.setState({
          drawerNotificationsVisible: !drawerNotificationsVisible,
        });
        break;

      default:
        break;
    }
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
      meetings,
      myAvatar,
      screenLoading,
    } = this.state;

    const uid = localStorage.getItem('uid');

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

    const pendingMeetings = meetings.filter(
      elem =>
        elem.status === 'pending' ||
        (elem.status === 'unseen' && elem.with === uid),
    );
    const cancelledMeetings = meetings.filter(
      elem => elem.status === 'cancelled',
    );
    const acceptedMeetings = meetings.filter(
      elem => elem.status === 'accepted',
    );
    const doneMeetings = meetings.filter(elem => elem.status === 'done');
    const notifications = meetings.filter(
      elem => elem.status === 'unseen' && elem.with === uid,
    );
    const requestedMeetings = meetings.filter(
      elem =>
        elem.setBy === uid &&
        (elem.status === 'pending' || elem.status === 'unseen'),
    );

    const meetingSatus = [
      {
        desc: `${pendingMeetings.length} Meetings Request Pending`,
        id: 1,
        title: 'PENDING',
      },
      {
        desc: `${cancelledMeetings.length} Meetings Cancelled`,
        id: 2,
        title: 'CANCELLED',
      },
      {
        desc: `${acceptedMeetings.length} Meetings Accepted`,
        id: 3,
        title: 'ACCEPTED',
      },
      {
        desc: `${doneMeetings.length} Meetings Done`,
        id: 4,
        title: 'DONE',
      },
      {
        desc: `${requestedMeetings.length} Requested Meetings`,
        id: 5,
        title: 'REQUESTED',
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
                      onClick={() => this.switchDrawer(item.title)}
                      type="primary"
                    >
                      View
                    </Button>
                  </List.Item>
                )}
              />
            </Col>
            <Col span={24}>
              <PendingDrawer
                visible={drawerPendingVisible}
                close={this.switchDrawer}
                data={pendingMeetings}
              />
              <CancelledDrawer
                visible={drawerCancelVisible}
                close={this.switchDrawer}
                data={cancelledMeetings}
              />
              <AcceptedDrawer
                visible={drawerAcceptedVisible}
                close={this.switchDrawer}
                data={acceptedMeetings}
              />
              <DoneDrawer
                visible={drawerDoneVisible}
                close={this.switchDrawer}
                data={doneMeetings}
              />
              <RequestedDrawer
                visible={drawerRequestedVisible}
                close={this.switchDrawer}
                data={requestedMeetings}
              />
              <Notifications
                visible={drawerNotificationsVisible}
                close={this.switchDrawer}
                data={notifications}
                myAvatar={myAvatar}
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
