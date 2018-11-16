// MeetingPoint
import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import { Button, message as Message, Icon, Input, List, Modal } from 'antd';
import { connect } from 'react-redux';
import {
  removePersonToMeet as RemovePersonToMeet,
  setMeeting as SetMeeting,
  removeMeeting as RemoveMeeting,
} from '../../Redux/Actions';
import { FSExplore, FSSearch } from '../../api/Foursquare';
import Map from '../../Component/MapDirection';
import isLoggedIn from '../../Helper';

const { Search } = Input;

class MeetingPoint extends Component {
  constructor(props) {
    super(props);

    this.state = {
      btnLoading: false,
      data: [],
      destination: {},
      listLoading: false,
      mapLoaded: false,
      mapVisible: false,
      personToMeet: {},
      screenLoading: true,
      searched: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    const { history, personToMeet, user } = this.props;
    isLoggedIn(history, user);

    if (!personToMeet || Object.keys(personToMeet) < 1) {
      history.push('/home');
      return;
    }

    this.setState({ personToMeet });
    const { coords } = personToMeet.myData;

    fetch(`${FSExplore}ll=${coords.latitude},${coords.longitude}&limit=3`)
      .then(res => res.json())
      .then(res => {
        if (res.response.groups) {
          const { items } = res.response.groups[0];
          if (this.mounted)
            this.setState({ data: items, screenLoading: false });
        }
      })
      .catch(err => {
        Message.error('Something Went Wrong! See console for log.');
        console.log('ERROR => ', err);
        this.setState({ screenLoading: false });
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  selectPlace = place => {
    const { personToMeet } = this.state;
    const {
      user: { uid },
      setMeeting,
      removePersonToMeet,
    } = this.props;

    this.setState({ btnLoading: true });

    const meeting = {
      place: {
        address: place.location.address,
        coords: {
          latitude: place.location.lat,
          longitude: place.location.lng,
        },
        name: place.name,
      },
      setBy: {
        avatar: personToMeet.myData.avatar,
        id: uid,
        name: personToMeet.myData.name,
      },
      setWith: {
        avatar: personToMeet.userImages[0],
        email: personToMeet.email,
        id: personToMeet.uid,
        name: personToMeet.name,
      },
    };

    setMeeting(meeting);
    this.setState({ btnLoading: false });
    removePersonToMeet();
    const { history } = this.props;
    history.push('/meeting/time');
  };

  goHome = () => {
    const { history, removePersonToMeet } = this.props;
    removePersonToMeet();
    history.push('/home');
  };

  showDirection = place => {
    const { lat, lng } = place;
    this.setState({ mapVisible: true });
    const destination = { lat, lng };
    this.setState({
      destination,
      mapLoaded: true,
    });
  };

  closeMap = () => {
    this.setState({ mapVisible: false });
  };

  cancelMeeting = () => {
    const { history, removePersonToMeet, removeMeeting } = this.props;
    removePersonToMeet();
    removeMeeting();
    history.push('/home');
  };

  searchLocation(value) {
    const {
      personToMeet: { coords },
    } = this.state;

    this.setState({ data: [], listLoading: true, searched: true });

    fetch(`${FSSearch}ll=${coords.latitude},${coords.longitude}&query=${value}`)
      .then(res => res.json())
      .then(res => {
        const { venues } = res.response;
        if (this.mounted) this.setState({ data: venues, listLoading: false });
      })
      .catch(err => {
        Message.error('Something Went Wrong! See console for log.');
        console.log('ERROR => ', err);
        this.setState({ listLoading: false });
      });
  }

  render() {
    const {
      btnLoading,
      personToMeet: { coords },
      data,
      destination,
      listLoading,
      mapLoaded,
      mapVisible,
      screenLoading,
      searched,
      personToMeet,
    } = this.state;

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
        <h2>Where to meet?</h2>
        <p>Select a place to meet {personToMeet.name}</p>
        <Search
          placeholder="find other places"
          onSearch={value => this.searchLocation(value)}
          enterButton
        />
        {searched ? (
          <List
            loading={listLoading}
            itemLayout="horizontal"
            dataSource={data}
            style={{ marginTop: 10 }}
            renderItem={item => (
              <List.Item
                style={{
                  background: 'rgba(0,0,0,.03)',
                  margin: '10px 3px',
                  padding: 5,
                }}
              >
                <List.Item.Meta
                  style={{ padding: 10 }}
                  title={item.name}
                  description={item.location.address}
                />
                <div
                  style={{
                    minWidth: '150px',
                    textAlign: 'right',
                  }}
                >
                  <Button.Group>
                    <Button
                      loading={btnLoading}
                      type="primary"
                      onClick={() => this.selectPlace(item)}
                    >
                      Select
                    </Button>
                    <Button
                      loading={btnLoading}
                      type="primary"
                      onClick={() => this.showDirection(item.location)}
                    >
                      <img
                        src="data:image/png;base64,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"
                        alt="location"
                        style={{ height: '80%' }}
                      />
                    </Button>
                  </Button.Group>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div>
            <List
              loading={listLoading}
              style={{ marginTop: 10 }}
              itemLayout="horizontal"
              dataSource={data}
              renderItem={item => (
                <List.Item
                  style={{
                    background: 'rgba(0,0,0,.03)',
                    margin: '10px 3px',
                    padding: 5,
                  }}
                >
                  <List.Item.Meta
                    style={{ padding: 10 }}
                    title={item.venue.name}
                    description={item.venue.location.address}
                  />
                  <div
                    style={{
                      minWidth: '150px',
                      textAlign: 'right',
                    }}
                  >
                    <Button.Group>
                      <Button
                        loading={btnLoading}
                        type="primary"
                        onClick={() => this.selectPlace(item.venue)}
                      >
                        Select
                      </Button>
                      <Button
                        loading={btnLoading}
                        type="primary"
                        onClick={() => this.showDirection(item.venue.location)}
                      >
                        <img
                          src="data:image/png;base64,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"
                          alt="location"
                          style={{ height: '80%' }}
                        />
                      </Button>
                    </Button.Group>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}

        {
          <Button
            loading={btnLoading}
            style={{
              bottom: 30,
              float: 'right',
              position: 'fixed',
              right: 30,
            }}
            onClick={this.cancelMeeting}
            icon="close"
          >
            Cancel
          </Button>
        }
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
          {mapLoaded ? (
            <div>
              <Map origin={coords} destination={destination} />
            </div>
          ) : (
            <Icon type="loading" />
          )}
        </Modal>
      </div>
    );
  }
}

MeetingPoint.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired,
  removeMeeting: PropTypes.func.isRequired,
  removePersonToMeet: PropTypes.func.isRequired,
  setMeeting: PropTypes.func.isRequired,
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
  // eslint-disable-next-line
  personToMeet: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  personToMeet: state.meetingReducers.personToMeet,
  user: state.authReducers.user,
});

const mapDispatchToProps = dispatch => ({
  removeMeeting: () => dispatch(RemoveMeeting()),
  removePersonToMeet: () => dispatch(RemovePersonToMeet()),
  setMeeting: meeting => dispatch(SetMeeting(meeting)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MeetingPoint);
