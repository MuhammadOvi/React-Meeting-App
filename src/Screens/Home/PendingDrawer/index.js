import React, { Component } from 'react';
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
        title="Basic Drawer"
        placement="right"
        closable
        onClose={() => close('PendingDrawer')}
        visible={visible}
        width="100%"
      >
        <List
          dataSource={data}
          renderItem={item => (
            <List.Item key={item.id}>
              <List.Item.Meta
                avatar={<Avatar src={item.avatar} />}
                title={<a href="https://ant.design">{item.name}</a>}
                description={`At ${item.place.name} on ${item.date} at ${
                  item.time
                }`}
              />
              <Button type="primary">Accept</Button>
            </List.Item>
          )}
        />
      </Drawer>
    );
  }
}

/* eslint react/prop-types: 0 */
