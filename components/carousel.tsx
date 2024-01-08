import React from 'react';
import ReactCardCarousel from 'react-card-carousel';
import RskLinkCard from '../components/rsk-link-card';
import Row from 'react-bootstrap/Row';

function Carousel() {
  const reactCardCarouselProps = {
    autoplay: true,
    autoplay_speed: 5000
  };
  const devportalLinkCardProps = {
    link: 'https://developers.rsk.co/',
    icon: <img src={require('../assets/images/devportal-icon.svg')} alt="devportal-icon" />,
    title: 'DevPortal',
    backgroundColor: '#00b41f',
    description: 'For developers by developers'
  };
  const tutorialLinkCardProps = {
    link: 'https://developers.rsk.co/tutorials/',
    icon: <img src={require('../assets/images/tutorial-icon.svg')} alt="tutorial-icon" />,
    title: 'Tutorials',
    backgroundColor: '#f26122',
    description: 'Read and learn about how to develop Dapps on Rootstock'
  };
  const walletsLinkCardProps = {
    link: 'https://developers.rsk.co/develop/apps/wallets/',
    icon: <img src={require('../assets/images/wallet-icon.svg')} alt="wallet-icon" />,
    title: 'Wallets',
    backgroundColor: 'black',
    description: 'Try RSK with these wallets'
  };
  return (
    <div className="content-carousel">
      <ReactCardCarousel {...reactCardCarouselProps}>
        <Row>
          <RskLinkCard {...devportalLinkCardProps} />
        </Row>
        <Row>
          <RskLinkCard {...walletsLinkCardProps} />
        </Row>
        <Row>
          <RskLinkCard {...tutorialLinkCardProps} />
        </Row>
      </ReactCardCarousel>
    </div>
  )
}

export default Carousel
