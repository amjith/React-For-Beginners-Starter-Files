import React from 'react'
import AddFishForm from './AddFishForm'
import autobind from 'autobind-decorator'
import Firebase from 'firebase'
const ref = new Firebase('https://vivid-fire-6703.firebaseio.com/')

@autobind
class Inventory extends React.Component{
  constructor() {
    super()
    this.state = {
      uid: ''
    }
  }

  componentWillMount () {
    console.log('Checking to see if we can log them in.')
    var token = localStorage.getItem('token')
    if (token) {
      ref.authWithCustomToken(token, this.authHandler)
    }
  }

  authenticate(provider) {
    console.log('Trying to auth with', provider)
    ref.authWithOAuthPopup(provider, this.authHandler)
  }

  logout () {
    ref.unauth()
    localStorage.removeItem('item')
    this.setState({
      uid: null
    })
  }

  authHandler(err, authData) {
    if (err) {
      console.err(err)
      return
    }

    // save the login token in the browser
    localStorage.setItem('token', authData.token)

    console.log(this.props.params.storeId)
    const storeRef = ref.child(this.props.params.storeId)
    storeRef.on('value', (snapshot) => {
      let data = snapshot.val() || {}

      // claim it as our own if there is now owner.
      if (!data.owner) {
        storeRef.set({
          owner: authData.uid
        })
      }

      // update our state to reflect the current store owner and user
      this.setState({
        uid: authData.uid,
        owner: data.owner || authData.uid
      })
    })
  }

  renderLogin() {
    return (
      <nav className='login'>
        <h2>Inventory</h2>
        <p>Sign in to manage your store's inventory</p>
        <button className='github' onClick={this.authenticate.bind(this, 'github')}>
          Login with Github
        </button>
      </nav>

    )
  }
  renderInventory (key) {
    var linkState = this.props.linkState
    return (
      <div className='fish-edit' key={key}>
        <input type='text' valueLink={linkState('fishes.' + key + '.name')}/>
        <input type='text' valueLink={linkState('fishes.' + key + '.price')} />
        <select valueLink={linkState('fishes.' + key + '.status')}>
          <option value='available'>Fresh!</option>
          <option value='unavailable'>Sold Out!</option>
        </select>
        <textarea type='text' valueLink={linkState('fishes.' + key + '.desc')}></textarea>
        <input type='text' valueLink={linkState('fishes.' + key + '.image')} />
        <button onClick={this.props.removeFish.bind(null, key)}>Remove Fish</button>
      </div>
    )
  }

  render () {
    let logoutButton = <button onClick={this.logout}>Logout</button>

    // Check if they're NOT logged in
    if (!this.state.uid) {
      return (
        <div>
          {this.renderLogin()}
        </div>
      )
    }

    // Check if they are NOT the owner of the store.
    if (this.state.uid !== this.state.owner) {
      return (
        <div>
          <p>Sorry, you aren't the owner of this store.</p>
          {logoutButton}
        </div>
      )
    }

    return (
      <div>
        <h1>Inventory</h1>
        {logoutButton}
        { Object.keys(this.props.fishes).map(this.renderInventory) }
        <AddFishForm {...this.props}/>
        <button onClick={this.props.loadSampleFishes}>Load Sample Fishes</button>
      </div>
    )
  }
}

Inventory.propTypes = {
  linkState: React.PropTypes.func.isRequired,
  addFish: React.PropTypes.func.isRequired,
  removeFish: React.PropTypes.func.isRequired,
  loadSampleFishes: React.PropTypes.func.isRequired,
  fishes: React.PropTypes.object.isRequired
}

export default Inventory
