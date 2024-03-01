import React from 'react'

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className='copyright'>
        <div>
          <span>Built by</span>
          <img src={require('../assets/images/iov-icon.svg')} alt="" />
        </div>
        <p>Copyright © { year } RSK Labs. All rights reserved.</p>
      </div>
      <div className='links'>
        <a href="https://www.iovlabs.org" target='_blank'>About IOV Labs</a>
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
