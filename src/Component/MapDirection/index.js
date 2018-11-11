/* eslint-disable no-undef */
/* global google */
import React from 'react';
import { compose, withProps, lifecycle } from 'recompose';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer,
} from 'react-google-maps';
import { Icon } from 'antd';
import MapAPI from '../../api/GoogleMap';

const MapDirection = compose(
  withProps({
    containerElement: <div style={{ height: `400px` }} />,
    googleMapURL: MapAPI,
    loadingElement: <div style={{ height: `100%` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap,
  lifecycle({
    componentDidMount() {
      this.setLocation();
    },
    setLocation(nextProps) {
      const { origin, destination } = this.props;

      let oLatitude = origin.latitude || origin.lat;
      let oLongitude = origin.longitude || origin.lng;
      let dLat = destination.lat || destination.latitude;
      let dLng = destination.lng || destination.longitude;

      if (nextProps) {
        oLatitude = nextProps.origin.latitude || nextProps.origin.lat;
        oLongitude = nextProps.origin.longitude || nextProps.origin.lng;
        dLat = nextProps.destination.lat || nextProps.destination.latitude;
        dLng = nextProps.destination.lng || nextProps.destination.longitude;
      }

      const DirectionsService = new google.maps.DirectionsService();
      DirectionsService.route(
        {
          destination: new google.maps.LatLng(dLat, dLng),
          origin: new google.maps.LatLng(oLatitude, oLongitude),
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            this.setState({
              directions: result,
            });
          } else {
            // console.error(`error fetching directions ${result}`);
          }
        },
      );
    },
    shouldComponentUpdate(nextProps) {
      this.setLocation(nextProps);
      return true;
    },
  }),
)(
  props =>
    props.directions ? (
      <GoogleMap defaultZoom={14}>
        <DirectionsRenderer directions={props.directions} />
      </GoogleMap>
    ) : (
      <Icon
        type="loading"
        style={{ position: 'absolute', top: '45%', left: '50%' }}
      />
    ),
);
export default MapDirection;
