import React, { Component } from 'react';
import './style.css';
import { Drawer, Button, List, Avatar } from 'antd';

export default class PendingDrawer extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { visible, close, data } = this.props;

    return (
      <Drawer
        title="Pending Meetings"
        placement="right"
        closable
        onClose={() => close('PENDING')}
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
              <div
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 12,
                  width: '35px',
                }}
              >
                <Button
                  style={{ marginBottom: 5 }}
                  shape="circle"
                  icon="check"
                  type="primary"
                />
                <Button shape="circle" icon="close" type="danger" />
              </div>
            </List.Item>
          )}
        />
      </Drawer>
    );
  }
}

/* eslint react/prop-types: 0 */
