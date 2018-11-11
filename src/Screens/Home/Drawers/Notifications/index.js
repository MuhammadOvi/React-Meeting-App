import React, { Component } from 'react';
import './style.css';
import { Drawer, Button, Card, Row, Col, message as Message } from 'antd';
import firebase from '../../../../Config/firebase';

const Meetings = firebase.firestore().collection('Meetings');

export default class Notifications extends Component {
  constructor(props) {
    super(props);

    this.state = {
      btnLoading: false,
    };
  }

  manageRequest = (id, action) => {
    this.setState({ btnLoading: true });

    let status;
    let message;

    switch (action) {
      case 'accept':
        status = 'accepted';
        message = 'Meeting Request Accepted';
        break;

      case 'cancel':
        status = 'cancelled';
        message = 'Meeting Request Cancelled';
        break;

      case 'skip':
        status = 'pending';
        message = 'Meeting Request Skipped for Now!';
        break;

      default:
        break;
    }

    if (!status) {
      this.setState({ btnLoading: false });
      return;
    }

    Meetings.doc(id)
      .update({ status })
      .then(() => {
        Message.success(message);
        this.setState({ btnLoading: false });
      })
      .catch(err => {
        Message.error(err.message);
        this.setState({ btnLoading: false });
      });
  };

  render() {
    const { visible, close, data, myAvatar } = this.props;
    const { btnLoading } = this.state;

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
          {data.length > 100 ? (
            <Col span={24} style={{ textAlign: 'center' }}>
              {data.map(elem => (
                <Card
                  key={elem.id}
                  style={{
                    margin: 'auto',
                    marginBottom: 15,
                    width: 300,
                  }}
                  actions={[
                    <Button
                      loading={btnLoading}
                      onClick={() => this.manageRequest(elem.id, 'accept')}
                      icon="check"
                    />,
                    <Button
                      loading={btnLoading}
                      onClick={() => this.manageRequest(elem.id, 'cancel')}
                      icon="close"
                      type="danger"
                    />,
                    <Button
                      loading={btnLoading}
                      onClick={() => this.manageRequest(elem.id, 'skip')}
                    >
                      Skip
                    </Button>,
                  ]}
                >
                  <div className="avatars">
                    <img src={myAvatar} alt="avatar 1" />
                    <img src={elem.setByAvatar} alt="avatar 2" />
                  </div>
                  <Card.Meta
                    title={elem.setByName}
                    description={`${elem.place.name} on ${elem.date} at ${
                      elem.time
                    }`}
                  />
                </Card>
              ))}
            </Col>
          ) : (
            <Col span={24} style={{ textAlign: 'center' }}>
              <h3>Yay! No new meeting requests!</h3>
            </Col>
          )}
        </Row>
      </Drawer>
    );
  }
}

/* eslint react/prop-types: 0 */
