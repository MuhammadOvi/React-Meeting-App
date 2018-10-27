import React, { Component } from 'react';
import './style.css';

import PropTypes from 'prop-types';
import Swing from 'react-swing';
import { Direction } from 'swing';
import { Modal } from 'antd';
import StackCard from '../StackCard';

const { confirm } = Modal;

class CardSwing extends Component {
  componentDidMount() {
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
    const {
      history,
      history: {
        location: {
          state: { matchingUsers },
        },
      },
    } = this.props;

    confirm({
      cancelText: 'No',
      okText: 'Yes',
      onCancel() {},
      onOk() {
        localStorage.setItem(
          'personToMeet',
          JSON.stringify(matchingUsers[index]),
        );
        history.push('/meeting/location');
      },
      title: `Want to meet ${matchingUsers[index].name}`,
    });
  };

  render() {
    const {
      history: {
        location: {
          state: { matchingUsers },
        },
      },
    } = this.props;

    return (
      <div className="section">
        {matchingUsers ? (
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
        ) : (
          <h3>No matching user found!</h3>
        )}
      </div>
    );
  }
}

CardSwing.propTypes = {
  // eslint-disable-next-line
  history: PropTypes.object.isRequired,
  // eslint-disable-next-line
  matchingUsers: PropTypes.array,
};

export default CardSwing;
