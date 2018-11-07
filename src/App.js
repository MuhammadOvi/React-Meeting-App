import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { message as Message } from 'antd';

import Login from './Screens/Login';
import Home from './Screens/Home';
import Step1 from './Screens/Step1';
import Step2 from './Screens/Step2';
import Step3 from './Screens/Step3';
import Step4 from './Screens/Step4';
import MeetingPoint from './Screens/MeetingPoint';
import MeetingTime from './Screens/MeetingTime';
import UserCard from './Component/UserCard';

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

            <Route exact path="/profile" component={Home} />
            <Route exact path="/profile/step1" component={Step1} />
            <Route exact path="/profile/step2" component={Step2} />
            <Route exact path="/profile/step3" component={Step3} />
            <Route exact path="/profile/step4" component={Step4} />

            <Route exact path="/meeting/location" component={MeetingPoint} />
            <Route exact path="/meeting/time" component={MeetingTime} />

            <Route exact path="/matching-users" component={UserCard} />

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
