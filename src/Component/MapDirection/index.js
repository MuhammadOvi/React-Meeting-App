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
      const {
        origin: { latitude, longitude },
        destination: { lat, lng },
      } = this.props;

      let oLatitude = latitude;
      let oLongitude = longitude;
      let dLat = lat;
      let dLng = lng;

      if (nextProps) {
        oLatitude = nextProps.origin.latitude;
        oLongitude = nextProps.origin.longitude;
        dLat = nextProps.destination.lat;
        dLng = nextProps.destination.lng;
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
)(props => (
  <GoogleMap defaultZoom={8}>
    {props.directions && <DirectionsRenderer directions={props.directions} />}
  </GoogleMap>
));

export default MapDirection;
