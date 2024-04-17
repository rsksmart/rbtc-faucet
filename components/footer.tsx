import React from 'react'

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
        <a href="https://twitter.com/rootstock_io" target='_blank'><img src={require('../assets/images/x-icon.svg')} alt="" /></a>
        <a href="https://github.com/rsksmart" target='_blank'><img src={require('../assets/images/github-icon.svg')} alt="" /></a>
        <a href="https://discord.gg/fPerbqcWGE" target='_blank'><img src={require('../assets/images/discord-icon.svg')} alt="" /></a>
      </div>
    </footer>
  )
}

export default Footer
