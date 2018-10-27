// Step1
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Icon, Input, Button, message as Message } from 'antd';
import firebase from '../../Config/firebase';

const FormItem = Form.Item;
const Users = firebase.firestore().collection('Users');

class Step1 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    const { history } = this.props;

    const status = localStorage.getItem('status');
    if (status !== 'step0') history.push('/home');
  }

  submitStep = e => {
    e.preventDefault();
    this.setState({ loading: true });
    const {
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      const { nickName, phone } = values;
      if (!err) {
        const numValid = /^[0-9]{10}$/;
        if (!numValid.test(phone)) {
          Message.error('Invalid Number');
          this.setState({ loading: false });
          return;
        }

        Users.doc(localStorage.getItem('uid'))
          .update({ nickName, phone, status: 'step1' })
          .then(() => {
            const { history } = this.props;
            this.setState({ loading: false });
            localStorage.setItem('status', 'step1');
            history.push('/profile/step2');
          })
          .catch(error => {
            Message.error('Something Went Wrong! See console for log.');
            console.log('ERROR => ', error);
          });
      } else {
        this.setState({ loading: false });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { loading } = this.state;

    return (
      <div className="section">
        <h2>Step 01</h2>
        <p>Kindly provide some basic information.</p>

        <Form onSubmit={this.submitStep} className="login-form">
          <FormItem style={{ marginBottom: 10 }} label="Nickname">
            {getFieldDecorator('nickName', {
              rules: [
                { message: 'Please input your Nick Name!', required: true },
              ],
            })(
              <Input
                autoComplete="off"
                prefix={
                  <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
              />,
            )}
          </FormItem>
          <FormItem style={{ marginBottom: 10 }} label="Cell Number">
            {getFieldDecorator('phone', {
              rules: [
                { message: 'Please input your phone number!', required: true },
              ],
            })(<Input type="number" addonBefore="+92" />)}
          </FormItem>
          <FormItem
            style={{
              bottom: 0,
              position: 'absolute',
              right: 20,
            }}
          >
            <Button
              htmlType="submit"
              type="primary"
              icon="right"
              size="large"
              loading={loading}
            >
              Next
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

Step1.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired,
  // eslint-disable-next-line
  form: PropTypes.object.isRequired,
};
export default Form.create()(Step1);
