import React, { Component } from 'react';
import ModalImage from 'react-modal-image';
import { Drawer, Icon } from 'antd';

export default class PendingDrawer extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { visible, close, data, myAvatar } = this.props;
    const me = localStorage.getItem('uid');

    return (
      <Drawer
        title="Pending Meetings"
        placement="right"
        closable
        onClose={() => close('PENDING')}
        visible={visible}
        width="100%"
      >
        {data.length > 0 ? (
          data.map(item => (
            <div className="data-card" key={item.id}>
              <div className="data">
                <ModalImage
                  className="img"
                  small={item.setBy === me ? myAvatar : item.setByAvatar}
                  medium={item.setBy === me ? myAvatar : item.setByAvatar}
                  alt={item.setBy === me ? myAvatar : item.setByAvatar}
                />
                <span className="name">
                  {item.setBy === me ? item.withName : item.setByName}
                </span>
                <span className="place">
                  <Icon type="home" /> {item.place.name}
                </span>
                <span className="time">
                  <Icon type="clock-circle" /> {item.date} <b>({item.time})</b>
                </span>
                <span className="setBy">
                  <Icon type="user" /> Set by{' '}
                  {item.setBy === me ? 'me' : item.setByName}
                </span>
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
