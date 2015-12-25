import React from 'react'
import reactMixin from 'react-mixin'
import autobind from 'autobind-decorator'

// Firebase
import Rebase from 're-base'
var base = Rebase.createClass('https://vivid-fire-6703.firebaseio.com/')

import Catalyst from 'react-catalyst'

import Header from './Header'
import Fish from './Fish'
import Order from './Order'
import Inventory from './Inventory'

@autobind
class App extends React.Component {
  constructor () {
    super()
    this.state = {
      fishes: {},
      order: {}
    }
  }

  addFish (fish) {
    var timestamp = (new Date()).getTime()
    this.state.fishes[fish.name + timestamp] = fish
    this.setState({fishes: this.state.fishes})
  }

  addToOrder (key) {
    this.state.order[key] = (this.state.order[key] + 1) || 1
    this.setState({order: this.state.order})
  }

  removeFromOrder (key) {
    delete this.state.order[key]
    this.setState({order: this.state.order})
  }

  loadSampleFishes () {
    this.setState({fishes: require('../sample-fishes')})
  }

  renderFish (key) {
    return (
      <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder}/>
    )
  }

  removeFish (key) {
     this.state.fishes[key] = null
    //delete this.state.fishes[key]
    this.setState({fishes: this.state.fishes})
  }

  componentDidMount () {
    base.syncState(this.props.params.storeId + '/fishes', {
                    context: this,
                    state: 'fishes'
                   })
    var localStorageRef = localStorage.getItem('order-' + this.props.params.storeId)
    if (localStorageRef) {
      this.setState({order: JSON.parse(localStorageRef)})
    }
  }

  componentWillUpdate (nextProps, nextState) {
    localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order))
  }

  render () {
    return (
      <div className='catch-of-the-day'>
        <div className='menu'>
          <Header tagLine='Fresh Veg Food'/>
          <ul className='list-of-fishes'>
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order order={this.state.order} fishes={this.state.fishes} removeFromOrder={this.removeFromOrder}/>
        <Inventory addFish={this.addFish} loadSampleFishes={this.loadSampleFishes}
          fishes={this.state.fishes} linkState={this.linkState.bind(this)}
          removeFish={this.removeFish} {...this.props}/>
      </div>
    )
  }
}

reactMixin.onClass(App, Catalyst.LinkedStateMixin)

export default App
