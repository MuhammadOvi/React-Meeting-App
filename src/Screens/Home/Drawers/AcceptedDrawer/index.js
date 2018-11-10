import React, { Component } from 'react';
import ModalImage from 'react-modal-image';
import { Drawer, Icon, Button, Modal, Popconfirm } from 'antd';
import moment from 'moment-timezone';
import AddToCalendar from 'react-add-to-calendar';
import Map from '../../../../Component/MapDirection';

export default class AcceptedDrawer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      destination: {},
      mapVisible: false,
    };
  }

  closeMap = () => {
    const { close } = this.props;
    this.setState({ mapVisible: false }, close('ACCEPTED'));
  };

  showDirection = place => {
    const {
      coords: { latitude, longitude },
    } = place;
    const { close } = this.props;

    const destination = { latitude, longitude };
    this.setState({ destination, mapVisible: true }, close('ACCEPTED'));
  };

  render() {
    const { mapVisible, destination } = this.state;
    const { visible, close, data, myData, cancelMeeting } = this.props;
    const me = localStorage.getItem('uid');

    return (
      <Drawer
        title="Accepted Meetings"
        placement="right"
        closable
        onClose={() => close('ACCEPTED')}
        visible={visible}
        width="100%"
      >
        {data.length > 0 ? (
          data.map(item => (
            <div className="data-card" key={item.id}>
              <div className="data">
                <ModalImage
                  className="img"
                  small={item.withAvatar}
                  medium={item.withAvatar}
                  alt={item.withName}
                />
                <span className="name">{item.withName}</span>
                <span className="place">
                  <Icon type="home" /> {item.place.name}
                </span>
                <span className="time">
                  {item.date} (<b>{item.time}</b>)
                </span>
                <span className="info">
                  Set by {item.setBy === me ? 'me' : item.setByName}
                </span>
              </div>
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
                    description: `Have a meeting with ${
                      item.withName
                    } created with MEETLO APP! at ${item.place.name}`,
                    location: `${item.place.name} ${item.place.address}`,
                    startTime: `${moment(
                      `${item.date} ${item.time}`,
                      'DD-MM-YYYY hh:mm A',
                    ).format()}`,
                    title: `Meeting with ${item.withName}`,
                  }}
                />
                <Popconfirm
                  title={`Cancel meeting with ${item.withName}?`}
                  onConfirm={() => cancelMeeting(item.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button className="btn" type="danger">
                    Cancel Meeting
                  </Button>
                </Popconfirm>
              </div>
            </div>
          ))
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
