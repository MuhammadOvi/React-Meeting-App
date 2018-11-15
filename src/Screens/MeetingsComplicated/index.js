// Meetings Complicated
import React, { Component } from 'react';
import ModalImage from 'react-modal-image';
import { Icon, Button, message as Message, Skeleton } from 'antd';
import firebase from '../../Config/firebase';

const Users = firebase.firestore().collection('Users');
const Meetings = firebase.firestore().collection('Meetings');

export default class MeetingsComplicated extends Component {
  constructor(props) {
    super(props);

    this.state = {
      complicatedMeetingsSetByMe: [],
      complicatedMeetingsSetForMe: [],
      otherUsersData: [],
      screenLoading: true,
    };
  }

  componentDidMount() {
    this.mounted = true;

    this.checkComplicatedMeetingsSetByMe();
    this.checkComplicatedMeetingsSetForMe();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  checkComplicatedMeetingsSetByMe = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });
    Meetings.where('setBy', '==', localStorage.getItem('uid'))
      .orderBy('updated', 'desc')
      .where('status', '==', 'expired')
      .where('expired', '==', 'complicated')
      .onSnapshot(({ docs }) => {
        // setting all the meetingsSetByMe in one place
        const complicatedMeetingsSetByMe = docs.map(item => item.data());
        this.setState(
          { complicatedMeetingsSetByMe, screenLoading: false },
          () => this.bringOtherUsersData(),
        );
      });
  };

  checkComplicatedMeetingsSetForMe = () => {
    if (!this.mounted) return;
    this.setState({ screenLoading: true });
    Meetings.where('setWith', '==', localStorage.getItem('uid'))
      .orderBy('updated', 'desc')
      .where('status', '==', 'expired')
      .where('expired', '==', 'complicated')
      .onSnapshot(({ docs }) => {
        // setting all the meetingsSetForMe in one place
        const complicatedMeetingsSetForMe = docs.map(item => item.data());
        this.setState(
          { complicatedMeetingsSetForMe, screenLoading: false },
          () => this.bringOtherUsersData(),
        );
      });
  };

  bringOtherUsersData = () => {
    const {
      complicatedMeetingsSetByMe,
      complicatedMeetingsSetForMe,
      otherUsersData,
    } = this.state;
    const data = [
      ...complicatedMeetingsSetByMe,
      ...complicatedMeetingsSetForMe,
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

  render() {
    const {
      complicatedMeetingsSetByMe,
      complicatedMeetingsSetForMe,
      otherUsersData,
      screenLoading,
    } = this.state;

    const data = [
      ...complicatedMeetingsSetByMe,
      ...complicatedMeetingsSetForMe,
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
          <h3>Complicated Meetings</h3>
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

            if (item.unsuccessful && item.unsuccessful === me) {
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
                        was set by {item.setBy === me ? 'me' : name}
                      </span>
                    </div>
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

/* eslint react/prop-types: 0 */
