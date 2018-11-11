import React, { Component } from 'react';
import ModalImage from 'react-modal-image';
import { Drawer, Icon, Button, message as Message } from 'antd';
import firebase from '../../../../Config/firebase';

const Meetings = firebase.firestore().collection('Meetings');

export default class CancelledDrawer extends Component {
  close = () => {
    const { close } = this.props;
    close('CANCELLED');
  };

  cancelMeeting = meetingID => {
    const { myData } = this.props;
    const me = localStorage.getItem('uid');

    Meetings.doc(meetingID)
      .update({
        cancelledBy: me,
        notification: {
          by: me,
          message: `Meeting was cancelled by ${myData.name}`,
          seen: false,
        },
        status: 'cancelled',
      })
      .then(() => Message.success('Meeting Cancelled'))
      .catch(err => Message.error(err.message));
  };

  markNotificationSeen = meetingID => {
    Meetings.doc(meetingID)
      .update({ notification: firebase.firestore.FieldValue.delete() })
      .catch(err => Message.error(err.message));
  };

  render() {
    const { visible, data } = this.props;
    const me = localStorage.getItem('uid');

    let theAvatar;
    let theName;

    return (
      <Drawer
        title="Cancelled Meetings"
        placement="right"
        closable
        onClose={() => this.close()}
        visible={visible}
        width="100%"
      >
        {data.length > 0 ? (
          data.map(item => {
            if (item.setBy.id === me) {
              const { avatar } = item.setWith;
              const { name } = item.setWith;
              theAvatar = avatar;
              theName = name;
            } else {
              const { avatar } = item.setBy;
              const { name } = item.setBy;
              theAvatar = avatar;
              theName = name;
            }

            return (
              <div className="data-card" key={item.id}>
                <div className="data">
                  <ModalImage
                    className="img"
                    small={theAvatar}
                    medium={theAvatar}
                    alt={theName}
                  />
                  <span className="name">{theName}</span>
                  <span className="place">
                    <Icon type="home" /> {item.place.name}
                  </span>
                  <span className="time">
                    {item.date} (<b>{item.time}</b>)
                  </span>
                  <span className="info">
                    Set by {item.setBy.id === me ? 'me' : theName}
                  </span>
                  <span className="cancelled">
                    Cancelled by {item.cancelledBy === me ? 'me' : theName}
                  </span>
                </div>
                {item.notification &&
                  item.notification.by !== me && (
                    <div className="notification success">
                      <p>{item.notification.message}</p>
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
      </Drawer>
    );
  }
}

/* eslint react/prop-types: 0 */
