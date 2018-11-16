import React, { Component } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import Swing from 'react-swing';
import { Direction } from 'swing';
import { Modal, Button } from 'antd';
import { connect } from 'react-redux';
import { setPersonToMeet as SetPersonToMeet } from '../../Redux/Actions';
import StackCard from '../../Component/StackCard';
import isLoggedIn from '../../Helper';

const { confirm } = Modal;

class CardSwing extends Component {
  constructor(props) {
    super(props);

    const {
      history: {
        location: { state },
      },
    } = this.props;

    this.state = {
      matchingUsers: state ? state.matchingUsers : [],
    };
  }

  componentDidMount() {
    const { history, user } = this.props;
    isLoggedIn(history, user);
    console.clear();
  }

  swiped = (e, index) => {
    let agreed;

    if (e.throwDirection.toString() === 'Symbol(RIGHT)') agreed = true;
    else agreed = false;

    if (agreed) this.showConfirm(index);

    e.target.className += ' hidden';
  };

  btnClicked = (agreed, index) => {
    if (agreed) this.showConfirm(index);

    document.getElementsByClassName(`card-${index}`)[0].className += ' hidden';
  };

  showConfirm = index => {
    const { matchingUsers } = this.state;

    const {
      history,
      history: {
        location: { state },
      },
      setPersonToMeet,
    } = this.props;

    confirm({
      cancelText: 'No',
      okText: 'Yes',
      onCancel() {},
      onOk() {
        const personToMeet = {
          ...matchingUsers[index],
          myData: state.myData,
        };

        setPersonToMeet(personToMeet);
        history.push('/meeting/location');
      },
      title: `Want to meet ${matchingUsers[index].name}`,
    });
  };

  goHome = () => {
    const { history } = this.props;
    history.push('/home');
  };

  render() {
    const { matchingUsers } = this.state;

    return (
      <div className="section">
        {matchingUsers.length > 0 && (
          <div
            style={{
              left: 0,
              position: 'fixed',
              textAlign: 'center',
              top: 50,
              width: '100%',
            }}
          >
            <h3>No more matching users!</h3>
            <Button type="primary" onClick={this.goHome}>
              Home
            </Button>
          </div>
        )}
        {matchingUsers.length > 0 ? (
          <div>
            <Swing
              config={{
                allowedDirections: [Direction.LEFT, Direction.RIGHT],
              }}
              className="stack"
              tagName="div"
            >
              {matchingUsers.map((user, index) => (
                <div
                  key={Math.random()}
                  className={`card card-${index}`}
                  throwout={e => this.swiped(e, index)}
                >
                  <StackCard
                    user={user}
                    index={index}
                    btnClicked={this.btnClicked}
                  />
                </div>
              ))}
            </Swing>

            <Button
              style={{
                left: 2,
                position: 'absolute',
                top: 2,
              }}
              onClick={this.goHome}
              icon="arrow-left"
            />
          </div>
        ) : (
          <div style={{ marginTop: 15, textAlign: 'center' }}>
            <h3>No matching user found!</h3>
            <Button type="primary" onClick={this.goHome}>
              Home
            </Button>
          </div>
        )}
      </div>
    );
  }
}

CardSwing.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired,
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
  // eslint-disable-next-line
  matchingUsers: PropTypes.array,
  setPersonToMeet: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  personToMeet: state.meetingReducers.personToMeet,
  user: state.authReducers.user,
});

const mapDispatchToProps = dispatch => ({
  setPersonToMeet: personToMeet => dispatch(SetPersonToMeet(personToMeet)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CardSwing);
