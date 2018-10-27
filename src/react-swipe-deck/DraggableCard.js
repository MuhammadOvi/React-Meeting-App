import React, { Component } from 'react';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';
import SimpleCard from './SimpleCard';
import { translate3d } from './utils';

class DraggableCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
      initialPosition: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
      animation: null,
      pristine: true,
      beingSwiped: false,
      swipeDirection: 'none',
    };
    this.resetPosition = this.resetPosition.bind(this);
    this.handlePan = this.handlePan.bind(this);
  }

  resetPosition() {
    const { x, y } = this.props.containerSize;
    const card = ReactDOM.findDOMNode(this);

    const initialPosition = {
      x: 0, // Math.round((x - card.offsetWidth) / 2),
      y: 0, // Math.round((y - card.offsetHeight) / 2)
    };

    this.setState({
      swipeDirection: 'none',
      x: initialPosition.x,
      y: initialPosition.y,
      initialPosition,
      startPosition: { x: 0, y: 0 },
    });
  }

  panstart() {
    const { x, y } = this.state;
    this.setState({
      beingSwiped: true,
      animation: false,
      startPosition: { x, y },
      pristine: false,
    });
  }

  panend(ev) {
    const screen = this.props.containerSize;
    const card = ReactDOM.findDOMNode(this);

    const getDirection = () => {
      switch (true) {
        case this.state.x < -50:
          return 'Left';
        case this.state.x + (card.offsetWidth - 50) > screen.x:
          return 'Right';
        case this.state.y < -50:
          return 'Top';
        case this.state.y + (card.offsetHeight - 50) > screen.y:
          return 'Bottom';
        default:
          return false;
      }
    };
    const direction = getDirection();

    if (this.props[`onSwipe${direction}`]) {
      this.props[`onSwipe${direction}`]();
      this.props[`onOutScreen${direction}`](this.props.index);
    } else {
      this.setState({ animation: true, beingSwiped: false });
      this.resetPosition();
    }
  }

  panmove(ev) {
    this.setState(this.calculatePosition(ev.deltaX, ev.deltaY));
  }

  pancancel(ev) {
    // console.log(ev.type)
  }

  handlePan(ev) {
    ev.preventDefault();
    this[ev.type](ev);
    return false;
  }

  handleSwipe(ev) {
    // console.log(ev.type)
  }

  calculatePosition(deltaX, deltaY) {
    const { swipeDirection } = this.state;
    const newSwipeDirection = deltaX < 0 ? 'left' : 'right';
    if (swipeDirection !== newSwipeDirection) {
      this.setState({ swipeDirection: newSwipeDirection });
    }
    const {
      initialPosition: { x, y },
    } = this.state;
    return {
      x: x + deltaX,
      y: y + deltaY,
    };
  }

  componentDidMount() {
    this.hammer = new Hammer.Manager(ReactDOM.findDOMNode(this));
    this.hammer.add(new Hammer.Pan({ threshold: 2 }));

    this.hammer.on('panstart panend pancancel panmove', this.handlePan);
    this.hammer.on(
      'swipestart swipeend swipecancel swipemove',
      this.handleSwipe,
    );

    this.resetPosition();
    window.addEventListener('resize', this.resetPosition);
  }

  componentWillUnmount() {
    if (this.hammer) {
      this.hammer.stop();
      this.hammer.destroy();
      this.hammer = null;
    }
    window.removeEventListener('resize', this.resetPosition);
  }

  render() {
    const {
      x,
      y,
      animation,
      beingSwiped,
      pristine,
      initialPosition,
      swipeDirection,
    } = this.state;
    const { ...rest } = this.props;
    // console.log(beingSwiped);
    const style = translate3d(x, y, beingSwiped, initialPosition);
    return (
      <SimpleCard
        {...rest}
        beingSwiped={beingSwiped}
        swipeDirection={swipeDirection}
        style={style}
        className={animation ? 'animate' : pristine ? 'inactive' : ''}
      />
    );
  }
}

export default DraggableCard;
