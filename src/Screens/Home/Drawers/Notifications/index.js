import React, { Component } from 'react';
import './style.css';
import { Drawer, Button, Card, Row, Col } from 'antd';

export default class Notifications extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { visible, close } = this.props;

    return (
      <Drawer
        title="New Meeting Requests!"
        placement="left"
        closable
        onClose={() => close('NOTIFICATION')}
        visible={visible}
        width="100%"
      >
        <Row
          gutter={8}
          style={{
            height: '100%',
            padding: 5,
            width: '100%',
          }}
        >
          <Col span={24} style={{ textAlign: 'center' }}>
            <Card
              style={{
                margin: 'auto',
                width: 300,
              }}
              actions={[
                <Button icon="check">Accept</Button>,
                <Button icon="close" type="danger">
                  Decline
                </Button>,
              ]}
            >
              <div className="avatars">
                <img
                  src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                  alt="avatar 1"
                />
                <img
                  src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                  alt="avatar 2"
                />
              </div>
              <Card.Meta
                title="Muhammad Fahhem Akhtar"
                description="Pizza hut on 25-11-2018 at 05:00 PM"
              />
            </Card>
          </Col>
        </Row>
        {/* <Button
            style={{ marginBottom: 5 }}
            shape="circle"
            icon="check"
            type="primary"
          />
          <Button shape="circle" icon="close" type="danger" /> */}
      </Drawer>
    );
  }
}

/* eslint react/prop-types: 0 */
