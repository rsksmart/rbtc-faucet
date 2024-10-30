/* eslint-disable @next/next/no-img-element */
import React from 'react'
import LogoIcon from '@/assets/images/logo.svg';

function Navigation() {
  return (
    <nav className='navigation'>
      <div className='logo-rootstock'>
        <img src={LogoIcon.src} alt="" />
      </div>
    </nav>
  )
}

export default Navigation
