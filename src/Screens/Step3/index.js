// Step3
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Select, message as Message } from 'antd';
import { connect } from 'react-redux';
import { updateUserStatus as UpdateUserStatus } from '../../Redux/Actions';
import firebase from '../../Config/firebase';
import isLoggedIn from '../../Helper';

const FormItem = Form.Item;
const { Option } = Select;
const Users = firebase.firestore().collection('Users');

class Step3 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    const { history, user, status } = this.props;
    isLoggedIn(history, user);
    if (status !== 'step2') history.push('/home');
  }

  submitStep = e => {
    e.preventDefault();
    this.setState({ loading: true });
    const {
      form: { validateFields },
      updateUserStatus,
      user: { uid },
    } = this.props;
    validateFields((err, values) => {
      const { beverages, duration } = values;
      if (!err) {
        Users.doc(uid)
          .update({ beverages, duration, status: 'step3' })
          .then(() => {
            const { history } = this.props;
            this.setState({ loading: false });
            updateUserStatus({ status: 'step3' });
            history.push('/profile/step4');
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
        <h2>Step 03</h2>
        <p>Some more things to find you a better match!</p>

        <Form onSubmit={this.submitStep} className="login-form">
          <FormItem style={{ marginBottom: 10 }} label="Select Beverages">
            {getFieldDecorator('beverages', {
              rules: [{ message: 'Please Select Beverages!', required: true }],
            })(
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Please Select Beverages"
              >
                <Option key="Coffee">
                  <span>
                    <img
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJVSURBVGhD7Zo/SBZhHMffMtPBMtocLdItRBcRInJxkBrbCmwIHaVBKBAhQnIwKKjURYKQWiJoDBoiWhpsaopIQWtIpSaxf5/vjw7uPW7o/jx3z8l94IP8nkfeu+979zx399zbKIgD//5WmmO4gfetqjDn8A++sqrCXEIFeWxVhVlBBRm3qqL04y5+xw41hGjHSkwCp3AddTSm1BCiC7fwnlUecxq/oEI8w+g3P4rqe2qVp/TgNwxCHMYoM6j+m1Z5iHb6PWonH2ELRunDHfyNvWrwkcuoEG8w7kgM4Tbqf26rwVfeonZyxKpmujEIsYxxR8sL2nAPf2GrGiI8QYVYQK+nXU2p2tFNq5oJQv7A6PXEOw7hS5y1qhkNaoVctarCHMHXeM2qmnw4iiccq5nN6Wym8/8r6jx37V10RidqI5p5PjpSs5228QKdEQT5bJUbghvJOsj/UAdJwL4LogvnQEhNyQcxF4oMEqem/uuY+RpTZBA9dL0LGb5+6fY/E2WPkbOolRj1D6ohLT4M9juo/uiKTCJ8CDKG6l+0KiU+BVmyKiU+BNGzjPrnrUqJD0F0Sql/wqqU+BDkA6r/jFUpKTtI8MyvFUw9G6Wm7CAa4Op7aFUGygwyjD9RD3Un1ZCFsoJcwOCKfkMNWSkyiNa+plHrx6plbquTRQYJu4ZXMDeKDKKd1xFRHbeGnIkyB3uu1EESUAdJwr4JotcC2oh+HOOK86htPLfKIcHL/zm86kAtA+nznb+yvoi639HGXPkJj6NztGB2C3XLkKcPcBI1FlPQaPwFUwgy8TL56aMAAAAASUVORK5CYII="
                      alt="<coffee-icon>"
                      style={{ height: 14 }}
                    />
                  </span>{' '}
                  Coffee
                </Option>
                <Option key="Juice">
                  <span>
                    <img
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAL9SURBVGhD7ZpLqE1RGICvd6HklYEMCJlQBhIZIUUR8iiiPEoGRkTIzCORgSIUIikyQJKBgSiSRynKWxko7wF55Pl9K6vu4Hre/e9zts5XX/p3t/XvdfZe6/z/Opoa/Cd0wTf4rWB3YanMwZZupLW+xA5YGkfRxMtTVAx30DHHpagE2uFrNGl/LxTERnTMrSkqgTFowhspKo5R6Li3UlQCG9CE21NUHO3xLTp2Py9EcxZNNiNFxXIGHXtmigJpg66Pr9jbCwWzBp3I5hQFMhBNdBe7BzgJHd+nHsosNFG0r9CnH8YWNNFzfBDkezSHTz+M42iSaSmK4RSaY2KKgriGJhmeohh2ojmWpCiIZ2iSXimKYSWaY32KgviCJonEJ2EOn0wIndAEfvtGkivrgykKoBua4GmK4piC5jmWogA6ogncHiOZh+bZl6Ig8mLvmaIYVqM5Qhf7JTRJZPNzBM2xIEVBrEWTRPXWndHNxN2xjxeiGIJOxFoo4vVaio5/LkXBuJuYrOh93g/mBTr2eC9EMwA/4GcsqrlyRzyJTsJ/S2M+mvQjtra48/jnMDreY4xo2H5J7t1dmG6V9tx/i6X6FXQc191QrAnWRT4Vb8SucRFayvwOj5F2YO49buIgrCkjMH+/qEepvucrcC5OwMm4ED2zuo72/P6tH8I27Ip1gW3pdLTXdhPIk/qZdpjuem4cdYuL1QrWdXMavXHPdPegR6xj0dPKSuHidSIXUlRhGhOpNxoTqTeGoRO5mKIKMxWdyBNs64UqYqlyFZ2ILsPK4cl6Lssfod/2liPWYpXACtgS33LcSXhYMRhX/Yj1BLoJ1CWW4+vQ0/R8w+exL2asxfKPqJb+li+zsaYFo/9hwPOnvXgP883rbbTqbWlxe6BgtfsO89/7ytmj29+MxtLwAOIhNr95X6H9aK/9J7tTD/SgwQl8wuZjHcDQH3kyl9GELmBvZBP6ivgD5r+4GP0Q7mOejL1LKJ475aYo0kMYjp3f7kA9/BuJDSpMU9N3PmJStPBVtUMAAAAASUVORK5CYII="
                      alt="<juice-icon>"
                      style={{ height: 14 }}
                    />
                  </span>{' '}
                  Juice
                </Option>
                <Option key="Cocktail">
                  <span>
                    <img
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQ3SURBVGhD7Zl7qFVFFIevGkkPEx+Rf0RYUKgpGRhpKdIDoqAoI0hDfKBCDwvMigoVxVDQQnsXGiUUQVikZiJWlhZBSFj4h5WVPRTzWZlpWvl927Nod7z7eM699+y7r9wffNw7c2b2XrNnZs3MmoYqdCXMgy9hP/xb4lf4FKZBXyisBsOHEIZX4m94DS6AwqgDPAIap5GHYSVMAht3LmiwPfUQ2CvRIHtpBLS6bMRiCMPegX5wIl0DDj3r/AN3QqvKnghjpoMNq1anw6tg/SNwI7SKhoAN0BAncFPUCd4Gn/ELdIfc9RFowArI6on7YC9ckqQa11nwE/isZ8zIU0PBFzuxK82Jt8ByjyapbN0BltNddzEjLz0OvtjJXUkLwHJzklS2TgWHlmXHm5GXNoEvnZCksnUbWG5mkjo2B+bDF1DuqV4Cyy5KUjnpAPjSy5LUMfWA1bAeHoM+4Pj/EybCLRBfXTS8W4oHwfzPUnktgTY0qq4QxrjYhQaAbjR+06Mtgz2wtZSO3/LmfjhO+v8oUL7F6A9TYS48Bwvhd4jy38KWnPADxnszp8A+sMAVSSpbz8PXoAu2/AzIQ2fD9+A73XlkynFsIb9+lqaAZXS914LDzuF1K9RTesBY4z4upTPlSm7BT5LU8boY/gKNP88MdC9Y5w+4ChyW9UCv53t+BHumojxPxOS92owy6WL97fUk9Z9eBPPrjR/rUqhKnies9DnoANIaDR9A+Rexm9Nnlh+gsYnaFH4Dn+kHdv2qWueDLbeyu9hqd7427juw3stmtIAuhHBAs8yoVS5yMcSWwplQjVxz4hisU2iOXNc2g896E2o5SvxPkyEWQrt4JHSELJ0Gd0P4eeteB02Rx4B3wee47TkDmqUbIL0AbYMX4C64CW6Ge2AJxBCQ3aW/5l0EtSqciluf3ma0hHqCu+KDEIZmsQMehs7wRinP4eEwqVZjwHqHYLgZLS2NuR1eARemr0AjXZyeBOdVepHS4+n5NGoVOFxOpMvBBljHIEdh5OYzdsb2aiVZdjtY9mkziib3bfGVHTaNyd6L7dF7cAoUUuNAI22QMbG0dKuxCLsRdU4WWk+Axjp80uedCD3p4TwuFF5Odie9RjuMHE66cCOZrjn+32aUXq1d8GLt0WW3OblAphfPWvZzhZPrkY34Bsp32G1KEQhcl6TasNobUjS1N6Roam9I0dTekKLppGmIQQsbsgGaHSHJU8aMvUBdDjvBRgRu4Q35PAU2sJZARd3lbnYYGJQw6Jw2XHbBGtgIXrymf7Nha8EY2TnQKjKANxb8wmnjjId5nDUyUh7nMrDn9cRs8HrPaH/UMwTlVZ7XfbmpF3gdEUb8DN5wDYJa5N3gKPB6LyKdnvUNBOai9yEaYdzLoWEPNAc/hMMwnns91FXessbL6on3MHXXA2BcuF48CwOhghoajgJm7Ntfb7s4kwAAAABJRU5ErkJggg=="
                      alt="<cocktail-icon>"
                      style={{ height: 14 }}
                    />
                  </span>{' '}
                  Cocktail
                </Option>
              </Select>,
            )}
          </FormItem>
          <FormItem style={{ marginBottom: 10 }} label="Duration of Meeting">
            {getFieldDecorator('duration', {
              rules: [
                {
                  message: 'Please Select Duration of Meeting!',
                  required: true,
                },
              ],
            })(
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Please Select Duration of Meeting"
              >
                <Option key="20-mint">20 Mint</Option>
                <Option key="60-mint">60 Mint</Option>
                <Option key="120-mint">120 Mint</Option>
              </Select>,
            )}
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
              Last Step
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

Step3.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired,
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
  // eslint-disable-next-line
  status: PropTypes.object.isRequired,
  // eslint-disable-next-line
  form: PropTypes.object.isRequired,
  updateUserStatus: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  status: state.homeReducers.status,
  user: state.authReducers.user,
});

const mapDispatchToProps = dispatch => ({
  updateUserStatus: status => dispatch(UpdateUserStatus(status)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Form.create()(Step3));
