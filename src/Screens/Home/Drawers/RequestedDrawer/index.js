import React, { Component } from 'react';
import ModalImage from 'react-modal-image';
import { Drawer, Icon } from 'antd';
import moment from 'moment-timezone';
import AddToCalendar from 'react-add-to-calendar';

export default class RequestedDrawer extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { visible, close, data } = this.props;

    return (
      <Drawer
        title="Requested Meetings"
        placement="right"
        closable
        onClose={() => close('REQUESTED')}
        visible={visible}
        width="100%"
      >
        {data.length > 0 ? (
          data.map(item => (
            <div className="data-card" key={item.id}>
              <div className="data">
                <ModalImage
                  className="img"
                  small={item.avatar}
                  medium={item.avatar}
                  alt={item.name}
                />
                <span className="name">{item.name}</span>
                <span className="place">
                  <Icon type="home" /> {item.place.name}
                </span>
                <span className="time">
                  <Icon type="clock-circle" /> {item.date} <b>({item.time})</b>
                </span>
              </div>
              <div className="actions">
                <AddToCalendar
                  className="add-to-calender-btn"
                  displayItemIcons={false}
                  event={{
                    description: `Have a meeting with ${
                      item.name
                    } created with MEETLO APP! at ${item.place.name}`,
                    location: `${item.place.name} ${item.place.address}`,
                    startTime: `${moment(
                      `${item.date} ${item.time}`,
                      'DD-MM-YYYY hh:mm A',
                    ).format()}`,
                    title: `Meeting with ${item.name}`,
                  }}
                />
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
      </Drawer>
    );
  }
}

/* eslint react/prop-types: 0 */
