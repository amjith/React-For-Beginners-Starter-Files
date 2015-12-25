import React from 'react'

class Header extends React.Component{
  render () {
    return (
      <header className='top'>
        <h1>
          Catch
          <span className='ofThe'>
            <span className='of'>of</span>
            <span className='the'>the</span>
          </span>
          day
        </h1>
        <h3><span>{this.props.tagLine}</span></h3>
      </header>
    )
  }
}

Header.propTypes = {
  tagLine: React.PropTypes.string.isRequired
}

export default Header
