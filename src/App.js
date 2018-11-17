import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { message as Message } from 'antd';

import {
  Home,
  Login,
  MatchingUsers,
  MeetingPoint,
  MeetingTime,
  MeetingsAccepted,
  MeetingsCancelled,
  MeetingsComplicated,
  MeetingsDone,
  MeetingsExpired,
  MeetingsPending,
  MeetingsRequested,
  MyProfile,
  Notifications,
  Step1,
  Step2,
  Step3,
  Step4,
} from './Screens';

class App extends Component {
  componentDidMount() {
    if (window.innerWidth > 600)
      Message.warning('App will work best on Mobile Devices');
  }

  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Switch>
            <Route exact path="/" component={Login} />
            <Route exact path="/home" component={Home} />

            <Route exact path="/profile" component={MyProfile} />
            <Route exact path="/profile/step1" component={Step1} />
            <Route exact path="/profile/step2" component={Step2} />
            <Route exact path="/profile/step3" component={Step3} />
            <Route exact path="/profile/step4" component={Step4} />

            <Route exact path="/meeting/location" component={MeetingPoint} />
            <Route exact path="/meeting/time" component={MeetingTime} />

            <Route
              exact
              path="/meetings/accepted"
              component={MeetingsAccepted}
            />
            <Route exact path="/meetings/pending" component={MeetingsPending} />
            <Route
              exact
              path="/meetings/cancelled"
              component={MeetingsCancelled}
            />
            <Route
              exact
              path="/meetings/complicated"
              component={MeetingsComplicated}
            />
            <Route
              exact
              path="/meetings/rejected"
              component={MeetingsCancelled}
            />
            <Route exact path="/meetings/done" component={MeetingsDone} />
            <Route exact path="/meetings/expired" component={MeetingsExpired} />
            <Route
              exact
              path="/meetings/requested"
              component={MeetingsRequested}
            />
            <Route exact path="/notifications" component={Notifications} />

            <Route exact path="/matching-users" component={MatchingUsers} />

            <Route
              path="/"
              render={() => (
                <h1>Sorry, we could not find what you are looking for.</h1>
              )}
            />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
