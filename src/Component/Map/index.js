import React from 'react';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from 'react-google-maps';

const Map = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      defaultZoom={14}
      defaultCenter={{
        lat: props.coords.latitude,
        lng: props.coords.longitude,
      }}
      center={{ lat: props.coords.latitude, lng: props.coords.longitude }}
    >
      {props.isMarkerShown && (
        <Marker
          draggable
          onDragEnd={e => props.dragged(e)}
          position={{ lat: props.coords.latitude, lng: props.coords.longitude }}
        />
      )}
    </GoogleMap>
  )),
);

export default Map;
