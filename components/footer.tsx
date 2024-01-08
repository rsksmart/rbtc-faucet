import React from 'react'

function Footer() {
  return (
    <footer>
      <div className='copyright'>
        <div>
          <span>Built by</span>
          <img src={require('../assets/images/iov-icon.svg')} alt="" />
        </div>
        <p>Copyright © 2015 RSK Labs. All rights reserved.</p>
      </div>
      <div className='links'>
        <a href="https://www.iovlabs.org" target='_blank'>About IOV Labs</a>
        <a href="https://rootstock.io/community" target='_blank'>Help</a>
        <a href="https://rootstock.io/terms-conditions" target='_blank'>Terms & Conditions</a>
        <a href="https://dev.rootstock.io" target='_blank'>Documentation</a>
      </div>
      <div className='icons'>
        <img src={require('../assets/images/x-icon.svg')} alt="" />
        <img src={require('../assets/images/github-icon.svg')} alt="" />
        <img src={require('../assets/images/slack-icon.svg')} alt="" />
      </div>
    </footer>
  )
}

export default Footer
