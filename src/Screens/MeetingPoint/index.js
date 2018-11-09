// MeetingPoint
import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import { Button, message as Message, Icon, Input, List, Modal } from 'antd';
import firebase from '../../Config/firebase';
import { FSExplore, FSSearch } from '../../api/Foursquare';
import Map from '../../Component/MapDirection';

const { Search } = Input;
const Users = firebase.firestore().collection('Users');

class MeetingPoint extends Component {
  constructor(props) {
    super(props);

    this.state = {
      btnLoading: false,
      coords: {},
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
    const { history } = this.props;

    const personToMeet = JSON.parse(localStorage.getItem('personToMeet'));

    if (!personToMeet || Object.keys(personToMeet) < 1) {
      history.push('/home');
      return;
    }

    this.setState({ personToMeet });

    Users.doc(localStorage.getItem('uid'))
      .get()
      .then(res => {
        const { coords } = res.data();
        this.setState({ coords });
        return fetch(
          `${FSExplore}ll=${coords.latitude},${coords.longitude}&limit=3`,
        );
      })
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

    this.setState({ btnLoading: true });

    const meeting = {
      avatar: personToMeet.userImages[0],
      email: personToMeet.email,
      name: personToMeet.name,
      place: {
        coords: {
          latitude: place.location.lat,
          longitude: place.location.lng,
        },
        name: place.name,
      },
      setBy: localStorage.getItem('uid'),
      with: personToMeet.uid,
    };

    localStorage.setItem('meeting', JSON.stringify(meeting));
    this.setState({ btnLoading: false });
    localStorage.removeItem('personToMeet');
    const { history } = this.props;
    history.push('/meeting/time');
  };

  goHome = () => {
    const { history } = this.props;
    localStorage.removeItem('personToMeet');
    history.push('/home');
  };

  showDirection = place => {
    const { lat, lng } = place;
    const coords = JSON.parse(localStorage.getItem('coords'));
    this.setState({ mapVisible: true });
    const destination = { lat, lng };
    this.setState({
      coords,
      destination,
      mapLoaded: true,
    });
  };

  closeMap = () => {
    this.setState({ mapVisible: false });
  };

  cancelMeeting = () => {
    const { history } = this.props;
    localStorage.removeItem('meeting');
    localStorage.removeItem('personToMeet');
    history.push('/home');
  };

  searchLocation(value) {
    const { coords } = this.state;

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
      coords,
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
                <div style={{ textAlign: 'right' }}>
                  <Button
                    style={{ marginBottom: 5 }}
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
                    Direction
                  </Button>
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
                  <div style={{ textAlign: 'right' }}>
                    <Button
                      style={{ marginBottom: 5 }}
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
                      Direction
                    </Button>
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
              bottom: 20,
              float: 'right',
              position: 'absolute',
              right: 20,
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
};
export default MeetingPoint;
