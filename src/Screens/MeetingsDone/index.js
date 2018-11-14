// Meetings Done
/* eslint react/prop-types: 0 */
/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import ModalImage from 'react-modal-image';
import { Icon, Button, message as Message, Rate, Skeleton } from 'antd';
import firebase from '../../Config/firebase';

const Users = firebase.firestore().collection('Users');
const Meetings = firebase.firestore().collection('Meetings');

export default class MeetingsDone extends Component {
  constructor(props) {
    super(props);

    this.state = {
      meetingsSetByMe: [],
      meetingsSetForMe: [],
      otherUsersData: [],
      screenLoading: true,
    };
  }

  componentDidMount() {
    this.mounted = true;

    this.checkMeetingsSetByMe();
    this.checkMeetingsSetForMe();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  checkMeetingsSetByMe = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });
    Meetings.where('setBy', '==', localStorage.getItem('uid'))
      .orderBy('updated', 'desc')
      .where('status', '==', 'expired')
      .where('expired', '==', 'accepted')
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
    this.setState({ screenLoading: true });
    Meetings.where('setWith', '==', localStorage.getItem('uid'))
      .orderBy('updated', 'desc')
      .where('status', '==', 'expired')
      .where('expired', '==', 'accepted')
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
    const data = [...meetingsSetByMe, ...meetingsSetForMe];
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

  markSuccessful = (meetingID, success) => {
    const me = localStorage.getItem('uid');

    Meetings.doc(meetingID)
      .update({
        [`successful.${me}`]: success,
        updated: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        Message.success(
          success
            ? 'Wow! How was that?'
            : 'Sorry to know that, maybe next time :)',
        );
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

  rateMeeting = (meetingID, rating) => {
    const me = localStorage.getItem('uid');
    Meetings.doc(meetingID)
      .update({
        [`rating.${me}`]: rating,
        updated: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .catch(err => Message.error(err.message));
  };

  render() {
    const {
      screenLoading,
      meetingsSetByMe,
      meetingsSetForMe,
      otherUsersData,
    } = this.state;

    const data = [...meetingsSetByMe, ...meetingsSetForMe];
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
          <h3>Meetings Done</h3>
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

            let otherUserID;
            if (item.setBy === me) otherUserID = item.setWith;
            else otherUserID = item.setBy;

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
                  {item.successful && item.successful[me] ? (
                    <div className="rating">
                      <div className="my-rating">
                        <p>Rating By Me:</p>
                        <Rate
                          value={
                            item.rating && item.rating[me] ? item.rating[me] : 0
                          }
                          allowClear={false}
                          onChange={value => this.rateMeeting(item.id, value)}
                        />
                      </div>
                      <div className="other-rating">
                        <p>Rating By {name}:</p>
                        {item.rating && item.rating[otherUserID] ? (
                          <Rate
                            disabled
                            value={item.rating[otherUserID || 0]}
                          />
                        ) : (
                          <p>No ratings yet!</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ textAlign: 'center' }}>
                        Was the meeting successful?
                      </p>
                      <div className="actions">
                        <Button
                          type="primary"
                          className="btn"
                          onClick={() => this.markSuccessful(item.id, true)}
                        >
                          Yes!
                        </Button>
                        <Button
                          type="danger"
                          className="btn"
                          onClick={() => this.markSuccessful(item.id, false)}
                        >
                          No!
                        </Button>
                      </div>
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
