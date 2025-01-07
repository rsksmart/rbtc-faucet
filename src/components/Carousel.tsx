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
      description: 'Try RSK with these wallets',
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
        modules={[Autoplay, Pagination]} // Carga los módulos aquí
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
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
