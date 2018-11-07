import React from 'react';
import './style.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { Row, Col, Card, Icon } from 'antd';

const { Meta } = Card;

const StackCard = props => {
  const {
    btnClicked,
    index,
    user,
    user: { userImages },
  } = props;

  const settings = {
    arrows: false,
    dots: true,
    infinite: true,
    slidesToScroll: 1,
    slidesToShow: 1,
    speed: 500,
  };

  const carousel = (
    <Slider {...settings}>
      {userImages.map(image => (
        <div key={Math.random()}>
          <img style={{ height: 300 }} alt="example" src={image} />
        </div>
      ))}
    </Slider>
  );

  return (
    <Row>
      <Col type="flex" align="middle" justify="center">
        <Card
          style={{ width: '100%' }}
          cover={carousel}
          actions={[
            <Icon
              onClick={() => btnClicked(false, index)}
              type="close-circle"
              style={{ color: 'red', fontSize: '2em' }}
              theme="outlined"
            />,
            <Icon
              onClick={() => btnClicked(true, index)}
              type="check-circle"
              style={{ color: 'green', fontSize: '2em' }}
              theme="outlined"
            />,
          ]}
        >
          <Meta title={user.name} description={user.nickName} />
        </Card>
      </Col>
    </Row>
  );
};

export default StackCard;
/* eslint react/prop-types: 0 */
