'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import RskLinkCard from './rsk-link-card';
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
  const items: ICarousel[] = [
    {
      link: 'https://developers.rsk.co/develop/apps/wallets/',
      img: WalleIcon.src,
      title: 'Wallets',
      backgroundColor: 'black',
      description: 'Try Rootstock with these wallets',
    },
    {
      link: 'https://developers.rsk.co/tutorials/',
      img: TutorialIcon.src,
      title: 'Tutorials',
      backgroundColor: '#f26122',
      description: 'Read and learn about how to develop Dapps on Rootstock',
    },
    {
      link: 'https://developers.rsk.co/',
      img: DevportalIcon.src,
      title: 'DevPortal',
      backgroundColor: '#00b41f',
      description: 'For developers by developers',
    },
  ];

  return (
    <div className="content-carousel">
      <Swiper
        modules={[Autoplay, Pagination]} 
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}

        breakpoints={{
          480: {
            slidesPerView: 1.1,
            spaceBetween: 5,
          },
          768: {
            slidesPerView: 1.15,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 1.3,
            spaceBetween: 15, 
          },
          1440: { 
            slidesPerView: 1.5,
            spaceBetween: 20, 
          },
          1920: { 
            slidesPerView: 1.8,
            spaceBetween: 20,
          },
          2560: { 
            slidesPerView: 2,
            spaceBetween: 40,
          }
        }}
      >
        {items.map((item, i) => (
          <SwiperSlide key={i}>
            <RskLinkCard {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
