import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { message as Message } from 'antd';
import App from './App';
import 'antd/dist/antd.css';
import messageConfig from './Config/antD';

Message.config(messageConfig);

ReactDOM.render(<App />, document.getElementById('root'));
