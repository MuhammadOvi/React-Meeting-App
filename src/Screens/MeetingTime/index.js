// MeetingTime
import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import { Button, Icon, DatePicker, Popconfirm } from 'antd';
import moment from 'moment-timezone';
import AddToCalendar from 'react-add-to-calendar';
import { connect } from 'react-redux';
import { removeMeeting as RemoveMeeting } from '../../Redux/Actions';
import firebase from '../../Config/firebase';
import isLoggedIn from '../../Helper';

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
    const { history, meeting, user } = this.props;
    isLoggedIn(history, user);

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
    const { date, time, meeting } = this.state;

    this.setState({ btnLoading: true });

    const data = {
      created: firebase.firestore.FieldValue.serverTimestamp(),
      date,
      place: meeting.place,
      setBy: meeting.setBy.id,
      setWith: meeting.setWith.id,
      status: 'unseen',
      time,
      updated: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const ref = Meetings.doc();
    Meetings.doc(ref.id)
      .set({ ...data, id: ref.id })
      .then(() => {
        const { removeMeeting } = this.props;
        removeMeeting();
        this.setState({
          btnLoading: false,
          meeting: { ...meeting, date, time },
          meetingSet: true,
        });
      });
  };

  goHome = () => {
    const { history, removeMeeting } = this.props;
    removeMeeting();
    history.push('/home');
  };

  cancelMeeting = () => {
    const { history, removeMeeting } = this.props;
    removeMeeting();
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

    const name = meeting.setWith ? meeting.setWith.name : '';

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
            <p>Select a time to meet {name}</p>

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
              meeting.setWith && (
                <Popconfirm
                  title={`Sure want to send request to ${name}?`}
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
          <div className="new-meeting">
            <h2 style={{ fontWeight: 'lighter' }}>
              Meeting Set with {name}!<br />
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
                description: `Have a meeting with ${name} created with MEETLO APP! at ${
                  meeting.place.name
                }`,
                location: `${meeting.place.name} ${meeting.place.address}`,
                startTime: `${moment(
                  `${meeting.date} ${meeting.time}`,
                  'DD-MM-YYYY hh:mm A',
                ).format()}`,
                title: `Meeting with ${name}`,
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
  // eslint-disable-next-line
  meeting: PropTypes.object.isRequired,
  removeMeeting: PropTypes.func.isRequired,
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  meeting: state.meetingReducers.meeting,
  user: state.authReducers.user,
});

const mapDispatchToProps = dispatch => ({
  removeMeeting: () => dispatch(RemoveMeeting()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MeetingTime);
