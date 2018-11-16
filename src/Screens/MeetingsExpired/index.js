// Meetings Expired
/* eslint react/prop-types: 0 */
import React, { Component } from 'react';
import ModalImage from 'react-modal-image';
import { Icon, Button, message as Message, Skeleton } from 'antd';
import { connect } from 'react-redux';
import isLoggedIn from '../../Helper';
import firebase from '../../Config/firebase';

const Users = firebase.firestore().collection('Users');
const Meetings = firebase.firestore().collection('Meetings');

let unsubFirebaseSnapShot01;
let unsubFirebaseSnapShot02;

class MeetingsExpired extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expiredMeetingsSetByMe: [],
      expiredMeetingsSetForMe: [],
      otherUsersData: [],
      screenLoading: true,
    };
  }

  componentDidMount() {
    this.mounted = true;

    const { history, user } = this.props;
    isLoggedIn(history, user);

    this.checkExpiredMeetingsSetByMe();
    this.checkExpiredMeetingsSetForMe();
  }

  componentWillUnmount() {
    this.mounted = false;

    unsubFirebaseSnapShot01();
    unsubFirebaseSnapShot02();
  }

  checkExpiredMeetingsSetByMe = () => {
    if (!this.mounted) return;
    const {
      user: { uid },
    } = this.props;

    this.setState({ screenLoading: true });
    unsubFirebaseSnapShot01 = Meetings.where('setBy', '==', uid)
      .orderBy('updated', 'desc')
      .where('status', '==', 'expired')
      .where('expired', '==', 'pending')
      .onSnapshot(({ docs }) => {
        // setting all the meetingsSetByMe in one place
        const expiredMeetingsSetByMe = docs.map(item => item.data());
        this.setState({ expiredMeetingsSetByMe, screenLoading: false }, () =>
          this.bringOtherUsersData(),
        );
      });
  };

  checkExpiredMeetingsSetForMe = () => {
    if (!this.mounted) return;
    const {
      user: { uid },
    } = this.props;

    this.setState({ screenLoading: true });
    unsubFirebaseSnapShot02 = Meetings.where('setWith', '==', uid)
      .orderBy('updated', 'desc')
      .where('status', '==', 'expired')
      .where('expired', '==', 'pending')
      .onSnapshot(({ docs }) => {
        // setting all the meetingsSetForMe in one place
        const expiredMeetingsSetForMe = docs.map(item => item.data());
        this.setState({ expiredMeetingsSetForMe, screenLoading: false }, () =>
          this.bringOtherUsersData(),
        );
      });
  };

  bringOtherUsersData = () => {
    const {
      expiredMeetingsSetByMe,
      expiredMeetingsSetForMe,
      otherUsersData,
    } = this.state;
    const {
      user: { uid: me },
    } = this.props;

    const data = [...expiredMeetingsSetByMe, ...expiredMeetingsSetForMe];

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

  render() {
    const {
      expiredMeetingsSetByMe,
      expiredMeetingsSetForMe,
      otherUsersData,
      screenLoading,
    } = this.state;
    const {
      user: { uid: me },
    } = this.props;

    const data = [...expiredMeetingsSetByMe, ...expiredMeetingsSetForMe];

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
          <h3>Expired Meetings</h3>
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
                paragraph={{ rows: 3 }}
              >
                <div className="data-card expired">
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
                      Was set by {item.setBy === me ? 'me' : name}
                    </span>
                  </div>
                </div>
              </Skeleton>
            );
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
)(MeetingsExpired);
