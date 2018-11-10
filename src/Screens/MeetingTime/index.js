// MeetingTime
import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import { Button, Icon, DatePicker, Popconfirm } from 'antd';
import moment from 'moment-timezone';
import AddToCalendar from 'react-add-to-calendar';
import firebase from '../../Config/firebase';

const Meetings = firebase.firestore().collection('Meetings');

function disabledDate(current) {
  // Can not select days before today
  return current && current < moment().subtract(1, 'days');
}

class MeetingTime extends Component {
  constructor(props) {
    super(props);

    this.state = {
      btnLoading: false,
      date: '',
      meeting: {},
      meetingSet: false,
      screenLoading: true,
      time: '',
    };
  }

  componentDidMount() {
    this.mounted = true;
    const { history } = this.props;

    const meeting = JSON.parse(localStorage.getItem('meeting'));

    if (!meeting || Object.keys(meeting) < 1) {
      history.push('/home');
      return;
    }

    if (this.mounted) this.setState({ meeting, screenLoading: false });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setDateTime = value => {
    const date = moment(value).format('DD-MM-YYYY');
    const time = moment(value).format('hh:mm A');

    this.setState({ date, time });
  };

  sendRequest = () => {
    const { date, time } = this.state;
    let { meeting } = this.state;

    this.setState({ btnLoading: true });

    const data = {
      date,
      status: 'unseen',
      time,
    };

    meeting = { ...meeting, ...data };

    const ref = Meetings.doc();
    Meetings.doc(ref.id)
      .set({ ...meeting, ...data, id: ref.id })
      .then(() => {
        localStorage.removeItem('meeting');
        this.setState({ btnLoading: false, meeting, meetingSet: true });
      });
  };

  goHome = () => {
    const { history } = this.props;
    localStorage.removeItem('meeting');
    history.push('/home');
  };

  cancelMeeting = () => {
    const { history } = this.props;
    localStorage.removeItem('meeting');
    history.push('/home');
  };

  render() {
    const {
      btnLoading,
      date,
      time,
      screenLoading,
      meeting,
      meetingSet,
    } = this.state;

    const { history } = this.props;

    return (
      <div className="section">
        {screenLoading && (
          <div className="loading">
            <Icon type="loading" />
          </div>
        )}
        <Button
          style={{
            left: 2,
            position: 'absolute',
            top: 2,
          }}
          onClick={this.goHome}
          icon="home"
        />
        {!meetingSet ? (
          <div>
            <h2>When to meet?</h2>
            <p>Select a time to meet {meeting.name}</p>

            <DatePicker
              size="large"
              showTime={{ format: 'HH:mm:A', use12Hours: true }}
              format="YYYY-MM-DD HH:mm:A"
              placeholder="Select Time"
              onChange={this.setDateTime}
              onOk={this.setDateTime}
              style={{ width: '100%' }}
              disabledDate={disabledDate}
            />

            {date &&
              time &&
              meeting.name && (
                <Popconfirm
                  title={`Sure want to send request to ${meeting.name}?`}
                  onConfirm={this.sendRequest}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    loading={btnLoading}
                    type="primary"
                    style={{
                      bottom: 20,
                      left: 20,
                      position: 'absolute',
                    }}
                    icon="check"
                  >
                    Send Request
                  </Button>
                </Popconfirm>
              )}

            <Button
              loading={btnLoading}
              style={{
                bottom: 20,
                position: 'absolute',
                right: 20,
              }}
              onClick={this.cancelMeeting}
              icon="close"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div style={{ marginTop: 100, textAlign: 'center' }}>
            <h2 style={{ fontWeight: 'lighter' }}>
              Meeting Set with {meeting.name}!<br />
              On {meeting.date} at {meeting.time}
            </h2>
            <br />
            <Button
              loading={btnLoading}
              onClick={() => history.push('/home')}
              icon="home"
              type="primary"
              size="large"
            >
              HOME
            </Button>
            <br />
            <br />
            <AddToCalendar
              displayItemIcons={false}
              event={{
                description: `Have a meeting with ${
                  meeting.name
                } created with MEETLO APP! at ${meeting.place.name}`,
                location: `${meeting.place.name} ${meeting.place.address}`,
                startTime: `${moment(
                  `${meeting.date} ${meeting.time}`,
                  'DD-MM-YYYY hh:mm A',
                ).format()}`,
                title: `Meeting with ${meeting.name}`,
              }}
            />
          </div>
        )}
      </div>
    );
  }
}

MeetingTime.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired,
};
export default MeetingTime;
