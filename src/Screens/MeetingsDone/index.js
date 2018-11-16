// Meetings Done
/* eslint react/prop-types: 0 */
/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import ModalImage from 'react-modal-image';
import { Icon, Button, message as Message, Rate, Skeleton } from 'antd';
import { connect } from 'react-redux';
import isLoggedIn from '../../Helper';
import firebase from '../../Config/firebase';

const Users = firebase.firestore().collection('Users');
const Meetings = firebase.firestore().collection('Meetings');

let unsubFirebaseSnapShot01;
let unsubFirebaseSnapShot02;

class MeetingsDone extends Component {
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
      .where('status', '==', 'expired')
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
      .where('status', '==', 'expired')
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

    let data = [...meetingsSetByMe, ...meetingsSetForMe];
    data = data.filter(elem => elem.expired !== 'pending');

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

  markSuccessful = meetingID => {
    const {
      user: { uid: me },
    } = this.props;

    const obj = {
      notification: firebase.firestore.FieldValue.delete(),
      [`successful.${me}`]: true,
      updated: firebase.firestore.FieldValue.serverTimestamp(),
    };

    Meetings.doc(meetingID)
      .update(obj)
      .then(() => {
        Message.success('Wow! How was that?');
      })
      .catch(err => Message.error(err.message));
  };

  markUnSuccessful = meetingID => {
    const { meetingsSetByMe, meetingsSetForMe } = this.state;
    const {
      user: { uid: me },
    } = this.props;

    let data = [...meetingsSetByMe, ...meetingsSetForMe];
    data = data.filter(elem => elem.expired !== 'pending');
    const [currentMeeting] = data.filter(elem => elem.id === meetingID);

    const obj = {
      expired:
        currentMeeting.expired && currentMeeting.expired === 'complicated'
          ? 'cancelled'
          : 'complicated',
      notification: firebase.firestore.FieldValue.delete(),
      [`successful.${me}`]: false,
      unsuccessful:
        currentMeeting.unsuccessful && currentMeeting.unsuccessful !== me
          ? 'both'
          : me,
      updated: firebase.firestore.FieldValue.serverTimestamp(),
    };

    Meetings.doc(meetingID)
      .update(obj)
      .then(() => {
        Message.success('Sorry to know that, maybe next time :)');
      })
      .catch(err => Message.error(err.message));
  };

  rateMeeting = (meetingID, rating) => {
    const {
      user: { uid: me },
    } = this.props;

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
    const {
      user: { uid: me },
    } = this.props;

    let data = [...meetingsSetByMe, ...meetingsSetForMe];
    data = data.filter(elem => elem.expired !== 'pending');

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

        {data.length > 0 &&
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

            if (
              !item.unsuccessful ||
              (item.unsuccessful &&
                (item.unsuccessful !== me && item.unsuccessful !== 'both'))
            ) {
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
                    {// if not reviewed by me, not yes, no or any rating
                    (item.successful && item.successful[me]) ||
                    (item.unsuccessful === me ||
                      item.unsuccessful === 'both') ? (
                      // eslint-disable-next-line react/jsx-indent
                      <div className="rating">
                        {/* if unsuccessful by me */}
                        <div className="my-rating">
                          {item.unsuccessful && item.unsuccessful === me ? (
                            <p>Meeting was marked unsuccessful by me!</p>
                          ) : (
                            <div>
                              <p>Rating By Me:</p>
                              <Rate
                                value={
                                  item.rating && item.rating[me]
                                    ? item.rating[me]
                                    : 0
                                }
                                allowClear={false}
                                onChange={value =>
                                  this.rateMeeting(item.id, value)
                                }
                              />
                            </div>
                          )}
                        </div>

                        {/* if unsuccessful by Other person */}
                        <div className="other-rating">
                          {item.unsuccessful &&
                          item.unsuccessful === otherUserID ? (
                            <p>Meeting was marked unsuccessful by {name}!</p>
                          ) : (
                            <div>
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
                            onClick={() => this.markSuccessful(item.id)}
                          >
                            Yes!
                          </Button>
                          <Button
                            type="danger"
                            className="btn"
                            onClick={() => this.markUnSuccessful(item.id)}
                          >
                            No!
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Skeleton>
              );
            }
            return null;
          })}
        <div className="data-card no-data">
          <h3>No Data</h3>
        </div>
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
)(MeetingsDone);
