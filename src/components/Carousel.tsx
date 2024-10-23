'use client'
import ReactCardCarousel from "react-card-carousel";
import RskLinkCard from "./rsk-link-card";
import WalleIcon from '@/assets/images/wallet-icon.svg';
import TutorialIcon from '@/assets/images/tutorial-icon.svg';
import DevportalIcon from '@/assets/images/devportal-icon.svg';

interface ICarousel {
  title: string;
  description: string;
  link: string;
  img: string;
  backgroundColor: string;
}

const Carousel = () => {

  const reactCardCarouselProps = {
    autoplay: true,
    autoplay_speed: 5000
  };
  const items: ICarousel[] = [
    {
      link: 'https://developers.rsk.co/develop/apps/wallets/',
      img: WalleIcon.src,
      title: 'Wallets',
      backgroundColor: 'black',
      description: 'Try RSK with these wallets'
    },
    {
      link: 'https://developers.rsk.co/tutorials/',
      img: TutorialIcon.src,
      title: 'Tutorials',
      backgroundColor: '#f26122',
      description: 'Read and learn about how to develop Dapps on Rootstock'
    },
    {
       link: 'https://developers.rsk.co/',
       img: DevportalIcon.src,
       title: 'DevPortal',
       backgroundColor: '#00b41f',
       description: 'For developers by developers'
     }
  ] 
    
  return (
    <div className="content-carousel">
      <ReactCardCarousel {...reactCardCarouselProps}>
        {
          items.map((item, i) => (
            <RskLinkCard key={i} {...item} />
          ))
        }
      </ReactCardCarousel>
    </div>
  );
};

export default Carousel;
