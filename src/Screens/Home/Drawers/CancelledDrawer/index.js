import React, { Component } from 'react';
import './style.css';
import { Drawer, List, Avatar } from 'antd';

export default class CancelledDrawer extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { visible, close, data } = this.props;

    return (
      <Drawer
        title="Cancelled Meetings"
        placement="right"
        closable
        onClose={() => close('CANCELLED')}
        visible={visible}
        width="100%"
      >
        <List
          bordered
          dataSource={data}
          renderItem={item => (
            <List.Item
              key={item.id}
              extra={<div style={{ textAlign: 'center' }}>{item.time}</div>}
              style={{
                position: 'relative',
                width: '100%',
              }}
            >
              <List.Item.Meta
                style={{
                  position: 'absilute',
                  width: '100%',
                }}
                avatar={<Avatar src={item.avatar} />}
                title={item.name}
                description={`At ${item.place.name} - ${item.date}`}
              />
            </List.Item>
          )}
        />
      </Drawer>
    );
  }
}

/* eslint react/prop-types: 0 */
