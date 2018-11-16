import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { message as Message } from 'antd';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './Redux/store';
import App from './App';
import 'antd/dist/antd.css';
import messageConfig from './Config/antD';

Message.config(messageConfig);

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root'),
);
