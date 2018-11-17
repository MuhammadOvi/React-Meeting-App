// MyProfile
/* eslint react/prop-types: 0 */
/* eslint sort-keys: 0 */
import React, { Component } from 'react';
import './style.css';
import {
  Form,
  Input,
  Icon,
  message as Message,
  Select,
  Button,
  Upload,
  Modal,
} from 'antd';

import { connect } from 'react-redux';
import isLoggedIn from '../../Helper';
import firebase from '../../Config/firebase';
import Map from '../../Component/Map';
import MapAPI from '../../api/GoogleMap';

const { Option } = Select;
const Users = firebase.firestore().collection('Users');
const Storage = firebase.storage();

let unsubFirebaseSnapShot;

class MyProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      screenLoading: true,
      btnLoading: false,
      formDisabled: true,

      imageListToUpload: [],
      initialImageListToUpload: [],
      imageListForPreview: [],
      currentModalPreviewImage: '',
      imageModalVisible: false,

      mapModalVisible: false,
      coords: null,
    };
  }

  componentDidMount() {
    this.mounted = true;

    const { history, user } = this.props;
    isLoggedIn(history, user);

    this.bringData();
  }

  componentWillUnmount() {
    this.mounted = false;
    unsubFirebaseSnapShot();
  }

  bringData = () => {
    const {
      user: { uid },
    } = this.props;

    unsubFirebaseSnapShot = Users.doc(uid).onSnapshot(res => {
      this.setState({ data: res.data(), screenLoading: false });
      const {
        form: { setFieldsValue },
      } = this.props;

      const {
        name,
        email,
        nickName,
        phone,
        userImages,
        duration,
        coords,
        beverages,
      } = res.data();

      setFieldsValue({
        name,
        nickName,
        email,
        phone,
        beverages,
        duration,
      });

      const imageListForPreview = userImages.map((img, index) => ({
        uid: index,
        name: index + 1,
        url: img,
      }));

      this.setState({
        imageListForPreview,
        imageListToUpload: imageListForPreview,
        initialImageListToUpload: imageListForPreview,
        coords,
      });
    });
  };

  updateData = e => {
    e.preventDefault();
    const { formDisabled } = this.state;
    const {
      form: { validateFields },
      user: { uid },
    } = this.props;

    if (formDisabled) {
      this.setState({ formDisabled: false });
      return;
    }

    validateFields((err, values) => {
      const { name, nickName, email, phone, beverages, duration } = values;
      const {
        data,
        coords,
        imageListToUpload,
        initialImageListToUpload,
      } = this.state;
      if (!err) {
        let shouldImageUpload = false;
        if (
          JSON.stringify(imageListToUpload) !==
          JSON.stringify(initialImageListToUpload)
        ) {
          const size = imageListToUpload.length;
          if (size > 3) {
            Message.error('Only 3 Images are allowed, please delete extras');
            return;
          }

          if (size < 3) {
            Message.error('We need all 3 images!');
            return;
          }

          shouldImageUpload = true;
        }

        if (shouldImageUpload) {
          const userImages = [];

          // set it up
          Storage.ref(uid).constructor.prototype.putFiles = files =>
            Promise.all(
              files.map((file, index) =>
                Storage.ref(uid)
                  .child(`${index + 1}`)
                  .put(file)
                  .then(res => {
                    Message.info(
                      `Image # ${index + 1} Uploaded... Processing...`,
                    );
                    this.setState({ btnLoading: true, screenLoading: true });
                    return res.ref.getDownloadURL();
                  })
                  .then(url => userImages.push(url)),
              ),
            );

          // use it!
          Storage.ref(uid)
            .putFiles(imageListToUpload)
            .then(() => {
              Users.doc(uid)
                .update({ userImages })
                .then(() => {
                  this.setState({ btnLoading: false, screenLoading: false });
                  Message.success('Images Uploaded');
                })
                .catch(Err => {
                  this.setState({ btnLoading: false, screenLoading: false });
                  Message.error('Something Went Wrong! See console for log.');
                  console.log('ERROR => ', Err);
                });
            })
            .catch(error => {
              this.setState({ btnLoading: false, screenLoading: false });
              Message.error('Error in Uploading Image, See console');
              console.log('ERROR =>', error);
            });
        }

        const updates = {
          ...(name !== data.name && { name }),
          ...(nickName !== data.nickName && { nickName }),
          ...(email !== data.email && { email }),
          ...(phone !== data.phone && { phone }),
          ...(JSON.stringify(beverages) !== JSON.stringify(data.beverages) && {
            beverages,
          }),
          ...(JSON.stringify(duration) !== JSON.stringify(data.duration) && {
            duration,
          }),
          ...(JSON.stringify(coords) !== JSON.stringify(data.coords) && {
            coords,
          }),
        };

        if (Object.keys(updates).length === 0) {
          this.setState({ formDisabled: true });
          return;
        }

        this.setState({ btnLoading: true });
        Users.doc(uid)
          .update(updates)
          .then(() => {
            this.setState({ btnLoading: false, formDisabled: true });
            Message.success('Data Updated!');
          })
          .catch(error => {
            this.setState({ btnLoading: false });
            Message.success(error.message);
            console.log('ERR => ', error);
          });
      }
    });
  };

  goHome = () => {
    const { history } = this.props;
    history.push('/home');
  };

  modalCancel = () =>
    this.setState({ imageModalVisible: false, mapModalVisible: false });

  imagePreview = file => {
    this.setState({
      currentModalPreviewImage: file.url || file.thumbUrl,
      imageModalVisible: true,
    });
  };

  imageChange = ({ fileList }) => {
    const filteredNewFileObj = fileList.filter(file => file.size);
    const newFileObj = filteredNewFileObj.map(file => file.originFileObj);
    this.setState({
      imageListToUpload: newFileObj,
      imageListForPreview: filteredNewFileObj,
    });
  };

  imageBeforeUpload = file => {
    this.setState(({ imageListToUpload }) => ({
      imageListToUpload: [file],
      imageListForPreview: [file],
    }));
    return false;
  };

  imageOnRemove = file => {
    const { formDisabled } = this.state;

    if (formDisabled) {
      Message.error('Please enable form editing');
      return false;
    }
    this.setState(({ imageListToUpload }) => {
      const index = imageListToUpload.indexOf(file);
      const newImageListToUpload = imageListToUpload.slice();
      newImageListToUpload.splice(index, 1);
      return {
        imageListToUpload: newImageListToUpload,
      };
    });
    return true;
  };

  mapDragged = e => {
    this.setState({
      coords: {
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng(),
      },
    });
  };

  render() {
    const {
      screenLoading,
      btnLoading,
      formDisabled,

      imageListForPreview,
      currentModalPreviewImage,
      imageModalVisible,

      mapModalVisible,
      coords,
    } = this.state;
    const {
      form: { getFieldDecorator },
    } = this.props;

    const uploadButton = (
      <div style={{}}>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload Images</div>
      </div>
    );

    return (
      <div className="section" style={{ paddingTop: 50 }}>
        {screenLoading && (
          <div className="loading">
            <Icon type="loading" />
          </div>
        )}
        <div
          style={{
            background: '#fff',
            left: 10,
            paddingLeft: 10,
            paddingTop: 5,
            position: 'fixed',
            top: 10,
            width: '100%',
            zIndex: 2,
          }}
        >
          <h3>My Profile</h3>
          <Button
            type="ghost"
            shape="circle"
            icon="close"
            style={{
              alignItems: 'center',
              background: '#fff',
              display: 'flex',
              height: 30,
              justifyContent: 'center',
              position: 'fixed',
              right: 15,
              top: 15,
              width: 30,
              zIndex: 2,
            }}
            onClick={this.goHome}
          />
        </div>

        <Form
          onSubmit={this.updateData}
          style={{ maxWidth: 480, margin: 'auto' }}
        >
          <Form.Item style={{ marginBottom: 10 }} label="Full Name">
            {getFieldDecorator('name', {
              rules: [{ message: 'Please input your name!', required: true }],
            })(
              <Input
                prefix={
                  <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                autoComplete="off"
                placeholder="name"
                readOnly={formDisabled}
              />,
            )}
          </Form.Item>
          <Form.Item
            style={{ marginBottom: 10 }}
            label="What's your nick name?"
          >
            {getFieldDecorator('nickName', {
              rules: [
                { message: 'Please input your nick name!', required: true },
              ],
            })(
              <Input
                prefix={
                  <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                autoComplete="off"
                placeholder="nick name"
                readOnly={formDisabled}
              />,
            )}
          </Form.Item>
          <Form.Item style={{ marginBottom: 10 }} label="Your email">
            {getFieldDecorator('email', {
              rules: [{ message: 'Please input your email!', required: true }],
            })(
              <Input
                type="email"
                prefix={
                  <Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                autoComplete="off"
                placeholder="email"
                readOnly={formDisabled}
              />,
            )}
          </Form.Item>
          <Form.Item style={{ marginBottom: 10 }} label="Your phone number">
            {getFieldDecorator('phone', {
              rules: [
                { message: 'Please input your phone number!', required: true },
              ],
            })(
              <Input
                type="number"
                addonBefore="+92"
                autoComplete="off"
                placeholder="phone"
                readOnly={formDisabled}
              />,
            )}
          </Form.Item>
          <Form.Item style={{ marginBottom: 10 }} label="Beverages">
            {getFieldDecorator('beverages', {
              rules: [{ message: 'Please Select Beverages!', required: true }],
            })(
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Please Select Beverages"
                disabled={formDisabled}
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
          </Form.Item>
          <Form.Item style={{ marginBottom: 10 }} label="Duration of Meeting">
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
                disabled={formDisabled}
              >
                <Option key="20-mint">20 Mint</Option>
                <Option key="60-mint">60 Mint</Option>
                <Option key="120-mint">120 Mint</Option>
              </Select>,
            )}
          </Form.Item>

          <Form.Item
            style={{ marginBottom: 10 }}
            className="profile"
            label="Your Images!"
          >
            {getFieldDecorator('images')(
              <Upload
                multiple
                action="http://jsonplaceholder.typicode.com/posts/"
                accept="image/*"
                listType="picture-card"
                fileList={imageListForPreview}
                onPreview={this.imagePreview}
                onChange={this.imageChange}
                onRemove={file => this.imageOnRemove(file)}
                beforeUpload={file => this.imageBeforeUpload(file)}
              >
                {!formDisabled ? uploadButton : null}
              </Upload>,
            )}
          </Form.Item>
          <Form.Item style={{ marginBottom: 10, textAlign: 'center' }}>
            <Button
              disabled={formDisabled}
              type="primary"
              onClick={() => this.setState({ mapModalVisible: true })}
            >
              Change My Location!
            </Button>
          </Form.Item>
          <Form.Item style={{ marginBottom: 10, textAlign: 'center' }}>
            <Button
              type={formDisabled ? 'default' : 'primary'}
              htmlType="submit"
              loading={btnLoading}
            >
              {formDisabled ? 'Edit Profile' : 'Save Changes'}
            </Button>
          </Form.Item>
        </Form>
        <Modal
          visible={mapModalVisible}
          footer={null}
          onCancel={this.modalCancel}
          style={{ top: 10 }}
        >
          {coords ? (
            <div style={{ textAlign: 'center' }}>
              <Map
                coords={coords}
                dragged={this.mapDragged}
                isMarkerShown
                googleMapURL={MapAPI}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `350px` }} />}
                mapElement={<div style={{ height: `100%` }} />}
              />
              <Button
                style={{ marginTop: 15 }}
                type="primary"
                onClick={this.modalCancel}
              >
                Save New Location
              </Button>
            </div>
          ) : (
            'No data available'
          )}
        </Modal>
        <Modal
          visible={imageModalVisible}
          footer={null}
          onCancel={this.modalCancel}
          style={{ top: 10 }}
        >
          <img
            alt="example"
            style={{ width: '100%' }}
            src={currentModalPreviewImage}
          />
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.authReducers.user,
});

const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Form.create()(MyProfile));
