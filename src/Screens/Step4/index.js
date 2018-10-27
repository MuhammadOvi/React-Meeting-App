// Step4
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, message as Message } from 'antd';
import Map from '../../Component/Map';
import firebase from '../../Config/firebase';
import MapAPI from '../../api/GoogleMap';

const Users = firebase.firestore().collection('Users');

class Step4 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      coords: null,
      loading: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    const { history } = this.props;

    const status = localStorage.getItem('status');
    if (status !== 'step3') history.push('/home');

    // this.setLocation();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setLocation = () => {
    navigator.geolocation.getCurrentPosition(position => {
      if (this.mounted) {
        this.setState({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      }
    });
  };

  submitStep = e => {
    e.preventDefault();

    const { coords } = this.state;
    if (!coords) return Message.error('Select a different Location');

    this.setState({ loading: true });

    Users.doc(localStorage.getItem('uid'))
      .update({ coords, status: 'completed' })
      .then(() => {
        const { history } = this.props;
        this.setState({ loading: false });
        localStorage.setItem('status', 'completed');
        history.push('/home');
      })
      .catch(err => {
        Message.error('Something Went Wrong! See console for log.');
        console.log('ERROR => ', err);
        this.setState({ loading: false });
      });
    return null;
  };

  dragged = e => {
    this.setState({
      coords: {
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng(),
      },
    });
  };

  render() {
    const { coords, loading } = this.state;

    return (
      <div className="section">
        <h2>Step 04</h2>
        <p>Whare are you now?</p>
        {coords ? (
          <Map
            coords={coords}
            dragged={this.dragged}
            isMarkerShown
            googleMapURL={MapAPI}
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `350px` }} />}
            mapElement={<div style={{ height: `100%` }} />}
          />
        ) : (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              height: 300,
              justifyContent: 'center',
            }}
          >
            <p style={{ textAlign: 'center', userSelect: 'none' }}>
              Please allow location to continue... <br />
              <Button onClick={this.setLocation}>Allow</Button>
            </p>
          </div>
        )}
        {coords && (
          <Button
            loading={loading}
            style={{
              bottom: 20,
              float: 'right',
              position: 'absolute',
              right: 20,
            }}
            onClick={this.submitStep}
            type="primary"
            icon="right"
          >
            Save Location (Phew!)
          </Button>
        )}
      </div>
    );
  }
}

Step4.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired,
};
export default Step4;
