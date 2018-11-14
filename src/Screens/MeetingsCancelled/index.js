// Meetings Cancelled
import React, { Component } from 'react';
import ModalImage from 'react-modal-image';
import { Icon, Button, message as Message, Skeleton } from 'antd';
import firebase from '../../Config/firebase';

const Users = firebase.firestore().collection('Users');
const Meetings = firebase.firestore().collection('Meetings');

export default class MeetingsCancelled extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cancelledMeetingsSetByMe: [],
      cancelledMeetingsSetForMe: [],
      otherUsersData: [],
      rejectedMeetingsSetByMe: [],
      rejectedMeetingsSetForMe: [],
      screenLoading: true,
    };
  }

  componentDidMount() {
    this.mounted = true;

    this.checkCancelledMeetingsSetByMe();
    this.checkRejectedMeetingsSetByMe();
    this.checkCancelledMeetingsSetForMe();
    this.checkRejectedMeetingsSetForMe();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  checkCancelledMeetingsSetByMe = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });
    Meetings.where('setBy', '==', localStorage.getItem('uid'))
      .orderBy('updated', 'desc')
      .where('status', '==', 'cancelled')
      .onSnapshot(({ docs }) => {
        // setting all the meetingsSetByMe in one place
        const cancelledMeetingsSetByMe = docs.map(item => item.data());
        this.setState({ cancelledMeetingsSetByMe, screenLoading: false }, () =>
          this.bringOtherUsersData(),
        );
      });
  };

  checkRejectedMeetingsSetByMe = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });
    Meetings.where('setBy', '==', localStorage.getItem('uid'))
      .orderBy('updated', 'desc')
      .where('status', '==', 'rejected')
      .onSnapshot(({ docs }) => {
        // setting all the meetingsSetByMe in one place
        const rejectedMeetingsSetByMe = docs.map(item => item.data());
        this.setState({ rejectedMeetingsSetByMe, screenLoading: false }, () =>
          this.bringOtherUsersData(),
        );
      });
  };

  checkCancelledMeetingsSetForMe = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });
    Meetings.where('setWith', '==', localStorage.getItem('uid'))
      .orderBy('updated', 'desc')
      .where('status', '==', 'cancelled')
      .onSnapshot(({ docs }) => {
        // setting all the meetingsSetForMe in one place
        const cancelledMeetingsSetForMe = docs.map(item => item.data());
        this.setState({ cancelledMeetingsSetForMe, screenLoading: false }, () =>
          this.bringOtherUsersData(),
        );
      });
  };

  checkRejectedMeetingsSetForMe = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });
    Meetings.where('setWith', '==', localStorage.getItem('uid'))
      .orderBy('updated', 'desc')
      .where('status', '==', 'rejected')
      .onSnapshot(({ docs }) => {
        // setting all the meetingsSetForMe in one place
        const rejectedMeetingsSetForMe = docs.map(item => item.data());
        this.setState({ rejectedMeetingsSetForMe, screenLoading: false }, () =>
          this.bringOtherUsersData(),
        );
      });
  };

  bringOtherUsersData = () => {
    const {
      cancelledMeetingsSetByMe,
      rejectedMeetingsSetByMe,
      cancelledMeetingsSetForMe,
      rejectedMeetingsSetForMe,
      otherUsersData,
    } = this.state;
    const data = [
      ...cancelledMeetingsSetByMe,
      ...rejectedMeetingsSetByMe,
      ...cancelledMeetingsSetForMe,
      ...rejectedMeetingsSetForMe,
    ];
    const me = localStorage.getItem('uid');

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
        this.setState({
          otherUsersData: [...otherUsersData, ...usersData],
          screenLoading: false,
        });
      })
      .catch(err => {
        console.log('err->', err);
        this.setState({ screenLoading: false });
      });
  };

  goHome = () => {
    const { history } = this.props;
    history.push('/home');
  };

  markNotificationSeen = meetingID => {
    Meetings.doc(meetingID)
      .update({
        notification: firebase.firestore.FieldValue.delete(),
        updated: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .catch(err => Message.error(err.message));
  };

  render() {
    const {
      cancelledMeetingsSetByMe,
      rejectedMeetingsSetByMe,
      cancelledMeetingsSetForMe,
      rejectedMeetingsSetForMe,
      otherUsersData,
      screenLoading,
    } = this.state;

    const data = [
      ...cancelledMeetingsSetByMe,
      ...rejectedMeetingsSetByMe,
      ...cancelledMeetingsSetForMe,
      ...rejectedMeetingsSetForMe,
    ];
    const me = localStorage.getItem('uid');

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
          <h3>Cancelled/Rejected Meetings</h3>
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

        {data.length > 0 ? (
          data.map(item => {
            const [withUser] = otherUsersData.filter(
              user =>
                (user.uid === item.setBy) === me ? item.setWith : item.setBy,
            );

            const [avatar] = withUser ? withUser.userImages : '';
            const { name } = withUser || '';

            return (
              <Skeleton key={item.id} loading={!withUser}>
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
                        <p>
                          Meeting{' '}
                          {item.status === 'cancelled'
                            ? 'cancelled'
                            : 'rejected'}{' '}
                          by {name}
                        </p>
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
                </div>
              </Skeleton>
            );
          })
        ) : (
          <div
            className="data-card"
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <h3>No Data</h3>
          </div>
        )}
      </div>
    );
  }
}

/* eslint react/prop-types: 0 */
