// Meetings Accepted
/* eslint react/prop-types: 0 */
import React, { Component } from 'react';
import ModalImage from 'react-modal-image';
import {
  Icon,
  Button,
  Popconfirm,
  message as Message,
  Modal,
  Skeleton,
} from 'antd';
import moment from 'moment-timezone';
import AddToCalendar from 'react-add-to-calendar';
import { connect } from 'react-redux';
import isLoggedIn from '../../Helper';
import firebase from '../../Config/firebase';
import Map from '../../Component/MapDirection';

const Users = firebase.firestore().collection('Users');
const Meetings = firebase.firestore().collection('Meetings');

let unsubFirebaseSnapShot01;
let unsubFirebaseSnapShot02;

class MeetingsAccepted extends Component {
  constructor(props) {
    super(props);

    this.state = {
      coords: {},
      destination: {},
      mapVisible: false,
      meetingsSetByMe: [],
      meetingsSetForMe: [],
      otherUsersData: [],
      screenLoading: true,
    };
  }

  componentDidMount() {
    this.mounted = true;

    const { history, user } = this.props;
    isLoggedIn(history, user);

    this.checkMeetingsSetByMe();
    this.checkMeetingsSetForMe();
  }

  componentWillUnmount() {
    this.mounted = false;
    unsubFirebaseSnapShot01();
    unsubFirebaseSnapShot02();
  }

  checkMeetingsSetByMe = () => {
    if (!this.mounted) return;
    const {
      user: { uid },
    } = this.props;

    this.setState({ screenLoading: true });
    unsubFirebaseSnapShot01 = Meetings.where('setBy', '==', uid)
      .orderBy('updated', 'desc')
      .where('status', '==', 'accepted')
      .onSnapshot(({ docs }) => {
        // setting all the meetingsSetByMe in one place
        const meetingsSetByMe = docs.map(item => item.data());
        this.setState({ meetingsSetByMe, screenLoading: false }, () =>
          this.bringOtherUsersData(),
        );
      });
  };

  checkMeetingsSetForMe = () => {
    if (!this.mounted) return;
    const {
      user: { uid },
    } = this.props;

    this.setState({ screenLoading: true });
    unsubFirebaseSnapShot02 = Meetings.where('setWith', '==', uid)
      .orderBy('updated', 'desc')
      .where('status', '==', 'accepted')
      .onSnapshot(({ docs }) => {
        // setting all the meetingsSetForMe in one place
        const meetingsSetForMe = docs.map(item => item.data());
        this.setState({ meetingsSetForMe, screenLoading: false }, () =>
          this.bringOtherUsersData(),
        );
      });
  };

  bringOtherUsersData = () => {
    const { meetingsSetByMe, meetingsSetForMe, otherUsersData } = this.state;
    const {
      user: { uid: me },
    } = this.props;
    const data = [...meetingsSetByMe, ...meetingsSetForMe];

    const idToFind = [];

    for (let i = 0; i < data.length; i++) {
      let id = data[i].setBy;
      if (data[i].setBy === me) id = data[i].setWith;

      if (!idToFind.includes(id)) idToFind.push(id);
    }

    const dbPromises = [];
    for (let i = 0; i < idToFind.length; i++) {
      dbPromises.push(
        Users.doc(idToFind[i])
          .get()
          .catch(err => Message.error(err.message)),
      );
    }

    Promise.all(dbPromises)
      .then(res => {
        const usersData = res.map(el => el.data());
        this.setState(
          {
            otherUsersData: [...otherUsersData, ...usersData],
            screenLoading: false,
          },
          () => this.checkExpired(),
        );
      })
      .catch(err => {
        console.log('err->', err);
        this.setState({ screenLoading: false });
      });
  };

  checkExpired = () => {
    const { meetingsSetByMe, meetingsSetForMe } = this.state;
    const data = [...meetingsSetByMe, ...meetingsSetForMe];

    const dbPromises = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
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

    if (dbPromises.length > 0) {
      Promise.all(dbPromises).catch(err => {
        console.log('err->', err);
      });
    }
  };

  goHome = () => {
    const { history } = this.props;
    history.push('/home');
  };

  cancelMeeting = meetingID => {
    const {
      user: { uid: me },
    } = this.props;

    Meetings.doc(meetingID)
      .update({
        cancelledBy: me,
        notification: me,
        status: 'cancelled',
        updated: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        Message.success('Meeting Cancelled');
      })
      .catch(err => Message.error(err.message));
  };

  markNotificationSeen = meetingID => {
    Meetings.doc(meetingID)
      .update({
        notification: firebase.firestore.FieldValue.delete(),
        updated: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .catch(err => Message.error(err.message));
  };

  showMap = (place, origin) => {
    const {
      coords: { latitude, longitude },
    } = place;

    const destination = { latitude, longitude };
    this.setState({ coords: origin, destination, mapVisible: true });
  };

  closeMap = () => {
    this.setState({ mapVisible: false });
  };

  render() {
    const {
      screenLoading,
      meetingsSetByMe,
      meetingsSetForMe,
      otherUsersData,

      mapVisible,
      coords,
      destination,
    } = this.state;

    const {
      user: { uid: me },
    } = this.props;

    const data = [...meetingsSetByMe, ...meetingsSetForMe];

    return (
      <div className="section" style={{ paddingTop: 50 }}>
        {screenLoading && (
          <div className="loading">
            <Icon type="loading" />
          </div>
        )}
        <div
          style={{
            background: '#fff',
            left: 10,
            paddingLeft: 10,
            paddingTop: 5,
            position: 'fixed',
            top: 10,
            width: '100%',
            zIndex: 2,
          }}
        >
          <h3>Accepted Meetings</h3>
          <Button
            type="ghost"
            shape="circle"
            icon="close"
            style={{
              alignItems: 'center',
              background: '#fff',
              display: 'flex',
              height: 30,
              justifyContent: 'center',
              position: 'fixed',
              right: 15,
              top: 15,
              width: 30,
              zIndex: 2,
            }}
            onClick={this.goHome}
          />
        </div>

        {data.length > 0 &&
          data.map(item => {
            const [withUser] = otherUsersData.filter(
              user =>
                (user.uid === item.setBy) === me ? item.setWith : item.setBy,
            );

            const [avatar] = withUser ? withUser.userImages : '';
            const { name } = withUser || '';

            return (
              <Skeleton
                key={item.id}
                loading={!withUser}
                title={{ width: '100%' }}
                active
                paragraph={{ rows: 6 }}
              >
                <div className="data-card">
                  <div className="data">
                    <ModalImage
                      className="img"
                      small={avatar}
                      medium={avatar}
                      alt={name}
                    />
                    <span className="name">{name}</span>
                    <span className="place">
                      <Icon type="home" /> {item.place.name}
                    </span>
                    <span className="time">
                      {item.date} (<b>{item.time}</b>)
                    </span>
                    <span className="info">
                      Set by {item.setBy === me ? 'me' : name}
                    </span>
                  </div>
                  {item.notification &&
                    item.notification !== me && (
                      <div className="notification success">
                        <p>Meeting accepted by {name}</p>
                        <Button
                          className="notification-close-btn"
                          shape="circle"
                          icon="close"
                          size="small"
                          type="danger"
                          onClick={() => this.markNotificationSeen(item.id)}
                        />
                      </div>
                    )}
                  <div className="actions">
                    <Button
                      className="btn"
                      onClick={() => this.showMap(item.place, withUser.coords)}
                    >
                      Show Map
                    </Button>
                    <AddToCalendar
                      className="add-to-calender-btn"
                      displayItemIcons={false}
                      buttonLabel="Add to Calender"
                      event={{
                        description: `Have a meeting with ${name} created with MEETLO APP! at ${
                          item.place.name
                        }`,
                        location: `${item.place.name} ${item.place.address}`,
                        startTime: `${moment(
                          `${item.date} ${item.time}`,
                          'DD-MM-YYYY hh:mm A',
                        ).format()}`,
                        title: `Meeting with ${name}`,
                      }}
                    />
                    <Popconfirm
                      title={`Cancel meeting with ${name}?`}
                      onConfirm={() => this.cancelMeeting(item.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button className="btn" type="danger">
                        Cancel Meeting
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </Skeleton>
            );
          })}
        <div className="data-card no-data">
          <h3>No Data</h3>
        </div>
        <Modal
          style={{ top: 10 }}
          visible={mapVisible}
          onCancel={this.closeMap}
          footer={[
            <Button key="back" onClick={this.closeMap}>
              Close
            </Button>,
          ]}
        >
          <Map origin={coords} destination={destination} />
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.authReducers.user,
});

const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MeetingsAccepted);
