import React, { Component } from 'react';
import ModalImage from 'react-modal-image';
import {
  Drawer,
  Icon,
  Button,
  Modal,
  Popconfirm,
  message as Message,
} from 'antd';
import moment from 'moment-timezone';
import AddToCalendar from 'react-add-to-calendar';
import Map from '../../../../Component/MapDirection';
import firebase from '../../../../Config/firebase';

const Meetings = firebase.firestore().collection('Meetings');

export default class PendingDrawer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      destination: {},
      mapVisible: false,
    };
  }

  closeMap = () => {
    this.setState({ mapVisible: false }, this.close());
  };

  showDirection = place => {
    const {
      coords: { latitude, longitude },
    } = place;

    const destination = { latitude, longitude };
    this.setState({ destination, mapVisible: true }, this.close());
  };

  close = () => {
    const { close } = this.props;
    close('PENDING');
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

  markNotificationSeen = meetingID => {};

  render() {
    const { mapVisible, destination } = this.state;
    const { visible, data, myData } = this.props;
    const me = localStorage.getItem('uid');

    let theAvatar;
    let theName;

    return (
      <Drawer
        title="Pending Meetings"
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
                </div>
                {item.notification &&
                  item.notification.by !== me &&
                  !item.notification.seen && (
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
                <div className="actions">
                  <Button
                    className="btn"
                    onClick={() => this.showDirection(item.place)}
                  >
                    Show Map
                  </Button>
                  <AddToCalendar
                    className="add-to-calender-btn"
                    displayItemIcons={false}
                    buttonLabel="Add to Calender"
                    event={{
                      description: `Have a meeting with ${theName} created with MEETLO APP! at ${
                        item.place.name
                      }`,
                      location: `${item.place.name} ${item.place.address}`,
                      startTime: `${moment(
                        `${item.date} ${item.time}`,
                        'DD-MM-YYYY hh:mm A',
                      ).format()}`,
                      title: `Meeting with ${theName}`,
                    }}
                  />
                  <Popconfirm
                    title={`Cancel meeting with ${theName}?`}
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
          <Map origin={myData.coords} destination={destination} />
        </Modal>
      </Drawer>
    );
  }
}

/* eslint react/prop-types: 0 */
