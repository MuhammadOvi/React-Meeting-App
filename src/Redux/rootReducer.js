import { combineReducers } from 'redux';
import { authReducers, homeReducers, meetingReducers } from './Reducers';

export default combineReducers({
  authReducers,
  homeReducers,
  meetingReducers,
});
