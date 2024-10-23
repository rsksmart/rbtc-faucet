import React from 'react'
import GithubIcon from '@/components/icons/GithubIcon';
import XIcon from '@/components/icons/XIcon';
import DiscordIcon from '@/components/icons/DiscordIcon';

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className='copyright'>
        <div>
          Built by <span className='title'>RootstockLabs</span>
        </div>
        <p>Copyright © { year } RootstockLabs. All rights reserved.</p>
      </div>
      <div className='links'>
        <a href="https://rootstock.io/" target='_blank'>About RootstockLabs</a>
        <a href="https://rootstock.io/community" target='_blank'>Help</a>
        <a href="https://rootstock.io/terms-conditions" target='_blank'>Terms & Conditions</a>
        <a href="https://dev.rootstock.io" target='_blank'>Documentation</a>
      </div>
      <div className='icons'>
        <a href="https://twitter.com/rootstock_io" target='_blank'><XIcon /></a>
        <a href="https://github.com/rsksmart" target='_blank'><GithubIcon /></a>  
        <a href="https://discord.gg/fPerbqcWGE" target='_blank'><DiscordIcon /></a>
      </div>
    </footer>
  )
}

export default Footer
