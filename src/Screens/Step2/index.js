// Step2
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Icon, Button, Upload, Modal, message as Message } from 'antd';
import { connect } from 'react-redux';
import { updateUserStatus as UpdateUserStatus } from '../../Redux/Actions';
import firebase from '../../Config/firebase';
import isLoggedIn from '../../Helper';

const Storage = firebase.storage();
const Users = firebase.firestore().collection('Users');

class Step2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fileList: [],
      fileListForPreview: [],
      loading: false,
      previewImage: '',
      previewVisible: false,
    };
  }

  componentDidMount() {
    const { history, user, status } = this.props;
    isLoggedIn(history, user);
    if (status !== 'step1') history.push('/home');
  }

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  handleChange = ({ fileList }) => {
    const newFileObj = fileList.map(x => x.originFileObj);
    this.setState({ fileList: newFileObj, fileListForPreview: fileList });
  };

  handleUpload = () => {
    const { fileList } = this.state;
    const {
      updateUserStatus,
      user: { uid },
    } = this.props;

    if (fileList.length > 3) {
      Message.error('Only 3 Images are allowed, please delete extras');
      return;
    }

    if (fileList.length < 3) {
      Message.error('We need all 3 images!');
      return;
    }

    this.setState({ loading: true });

    const userImages = [];

    // set it up
    Storage.ref(uid).constructor.prototype.putFiles = files =>
      Promise.all(
        files.map((file, index) =>
          Storage.ref(uid)
            .child(`${index + 1}`)
            .put(file)
            .then(res => {
              Message.info(`Image # ${index + 1} Uploaded... Processing...`);
              return res.ref.getDownloadURL();
            })
            .then(url => userImages.push(url)),
        ),
      );

    // use it!
    Storage.ref(uid)
      .putFiles(fileList)
      .then(() => {
        Users.doc(uid)
          .update({ status: 'step2', userImages })
          .then(() => {
            const { history } = this.props;
            this.setState({ loading: false });
            updateUserStatus({ status: 'step2' });
            Message.success('Images Uploaded');
            setTimeout(() => {
              history.push('/profile/step3');
            }, 1000);
          })
          .catch(err => {
            Message.error('Something Went Wrong! See console for log.');
            console.log('ERROR => ', err);
          });
      })
      .catch(error => {
        Message.error('Error in Uploading Image, See console');
        console.log('ERROR =>', error);
        this.setState({ loading: false });
      });
  };

  submitStep = e => {
    e.preventDefault();

    this.setState({ loading: true });
    const {
      form: { validateFields },
      updateUserStatus,
      user: { uid },
    } = this.props;
    validateFields((err, values) => {
      const { nickName, phone } = values;
      if (!err) {
        Users.doc(uid)
          .update({ nickName, phone, status: 'step1' })
          .then(() => {
            const { history } = this.props;
            this.setState({ loading: false });
            updateUserStatus({ status: 'step1' });
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
    const { loading, fileListForPreview } = this.state;

    const props = {
      beforeUpload: file => {
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file],
        }));
        return false;
      },
      onRemove: file => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
    };

    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div style={{}}>
        <Icon type="plus" />
        <div className="ant-upload-text">
          Upload {fileList.length === 0 && '3 Images'}
          {fileList.length === 1 && '2 more Images'}
          {fileList.length === 2 && '1 more Image'}
        </div>
      </div>
    );

    return (
      <div className="section">
        <h2>Step 02</h2>
        <p>
          Let&apos;s upload some of your beautiful Images. Your first image will
          be your Avatar
        </p>
        <div
          style={{
            margin: 'auto',
            maxWidth: '120px',
          }}
        >
          <Upload
            multiple
            action="http://jsonplaceholder.typicode.com/posts/"
            {...props}
            accept="image/*"
            listType="picture-card"
            fileList={fileListForPreview}
            onPreview={this.handlePreview}
            onChange={this.handleChange}
            onRemove={!loading}
          >
            {fileList.length >= 3 ? null : uploadButton}
          </Upload>
          <Modal
            visible={previewVisible}
            footer={null}
            onCancel={this.handleCancel}
          >
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </div>
        <div
          style={{
            bottom: 20,
            position: 'absolute',
            right: 20,
          }}
        >
          <Button
            onClick={this.handleUpload}
            type="primary"
            icon="right"
            size="large"
            loading={loading}
          >
            Upload and Next
          </Button>
        </div>
      </div>
    );
  }
}

Step2.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired,
  // eslint-disable-next-line
  form: PropTypes.object.isRequired,
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
)(Form.create()(Step2));
