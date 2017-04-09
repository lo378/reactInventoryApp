var React = require('react');
var ReactDom = require('react-dom');

var ReactRouter = require('react-router');


var Router = require('react-router-dom').BrowserRouter;
var Route = require('react-router-dom').Route;
var Link = require('react-router-dom').Link;
var Redirect = require('react-router-dom').Redirect;

var createHistory = require('history').createBrowserHistory;

/*
var History = require('react-router').hashHistory;
var CreateBrowserHistory = require('history/lib/CreateBrowserHistory');
*/


/*
var Router = require('react-router').Router
var Route = require('react-router').Route
var Switch = require('react-router').Switch
*/


var h = require('./helpers.js');

// friebase
var Rebase = require('re-base');
var base = Rebase.createClass('https://reacttenuapp.firebaseio.com/');





// Not Found component
var NoMatch = React.createClass({
  render: function () {
    return (
      <h1>Not Found</h1>
    );
  }
});


//SETUP ROUTING
var AppRoute = React.createClass({
  render: function () {
    return (
      <Router history={createHistory()}>
        <div>
          <Route exact path="/" component={StorePicker} />
          <Route path="/store/:storeId" component={App} />
          <Route component={NoMatch} />
        </div>
      </Router>
    );
  }
});





// App Component
var App = React.createClass({
  // iitial state
  getInitialState: function () {
    return {
      fishes: {},
      order: {}
    }
  },

  // componentdidmount 
  componentDidMount : function(){
    base.syncState(this.props.match.params.storeId +'/fishes', {
      context : this,
      state : 'fishes'
    });

    var localStorageRef = localStorage.getItem('order-' + this.props.match.params.storeId);
    if (localStorageRef){
      this.setState({
        order : JSON.parse(localStorageRef)
      });
    }

  },
  // componentdidmount
  componentWillUpdate : function(nextProps, nextState){
    localStorage.setItem('order-' + this.props.match.params.storeId, JSON.stringify(nextState.order))
  },
  //add fish method
  addFish: function (fish) {
      var timestamp = (new Date()).getTime();
      //update the state object
      this.state.fishes['fish-' + timestamp] = fish;
      // set the state
      this.setState({
        fishes: this.state.fishes
    });
  },

  //load sample method
  loadSamples: function(){
    this.setState({
      fishes: require('./sample-fishes')
    });
  },

   //
  addToOrder : function(key){
    this.state.order[key] = this.state.order[key] + 1 || 1;
    this.setState({
      order: this.state.order
    });
  },

  //
  renderFish : function(key){
    return <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder = {this.addToOrder}/>
  },

  // render
  render: function () {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="fresh SeaFood Market" />
          <ul className="list-of-fishes">
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order fishes={this.state.fishes} order={this.state.order} />
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples}/>
      </div>
    );
  }

});





//Fish Component
var Fish = React.createClass({
  onButtonClick: function(){
    var key = this.props.index;
    this.props.addToOrder(key);
  },
  render: function(){
    var details = this.props.details;
    var isAvailable = (details.status === 'available' ? true : false);
    var buttonText = (isAvailable ? 'Add To Order' : 'Sold Out');
    return(
      <li className="menu-fish">
       <img src={details.image} alt={details.name}/>
       <h3 className="fish-name">
         {details.name}
         <span className="price">{h.formatPrice(details.price)}</span>
       </h3>
       <p>{details.desc}</p>
       <button onClick={this.onButtonClick} disabled={!isAvailable}>{buttonText}</button>
      </li>
    )
  }

});




// Header Component
var Header = React.createClass({
  render: function () {
    return (
      <header className="top">
        <h1>Fresh
        <span className="ofThe">
            <span className="of"></span>
            <span className="the"></span>
          </span>
          catch
       </h1>
        <h3>{this.props.tagline}</h3>
      </header>
    );
  }

});





// Order Component
var Order = React.createClass({
  renderOrder: function(key) {
    var fish = this.props.fishes[key];
    var count = this.props.order[key];

    if(!fish){
      return <li key={key}>Sorry, fish no longer available</li>
    }

    return (<li key={key}>
    {count}Ibs
    {fish.name}
    <span className="price">{h.formatPrice(count + fish.price)}</span>
    </li>)
  },
  render: function () {
    var orderIds = Object.keys(this.props.order);

    var total = orderIds.reduce((prevTotal, key)=> {
      var fish = this.props.fishes[key];
      var count = this.props.order[key];
      var isAvailable = fish && fish.status === 'available';

      if(fish && isAvailable){
        return prevTotal + (count + parseInt(fish.price) || 0);
      }

      return prevTotal;
    }, 0);

    return (
      <div className="order-wrap">
        <h2 className="order-title">Your Order</h2>
        <ul className="order">
          {orderIds.map(this.renderOrder)}
          <li className="total">
            <strong>Total: </strong>
            {h.formatPrice(total)}
          </li>
        </ul>
      </div>
    );
  }

});




//Add fish component
var AddFishForm = React.createClass({
  createFish: function (e) {
    //stop form from submitting 
    e.preventDefault();
    // take the data from the form and create an object
    var fish = {
      name: this.refs.name.value,
      price: this.refs.price.value,
      status: this.refs.status.value,
      desc: this.refs.desc.value,
      image: this.refs.image.value,
    }
    // Add the fish to the app
    this.props.addFish(fish);
    this.refs.fishform.reset();
  },
  render: function () {
    return (
      <form className="fish-edit" ref="fishform" onSubmit={this.createFish.bind(this)}>
        <input type="text" ref="name" placeholder="Fish Name" />
        <input type="text" ref="price" placeholder="Fish Price" />
        <select ref="status">
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold out</option>
        </select>
        <textarea type="text" ref="desc" placeholder="Desc"></textarea>
        <input type="text" ref="image" placeholder="URL to Image" />
        <button type="submit"> + Add Item </button>
      </form>
    );
  }

});





// Inventory Component
var Inventory = React.createClass({
  render: function () {
    return (
      <div className="">
        <h2>Inventory</h2>
        <AddFishForm  {...this.props} />
        <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      </div>
    );
  }
});





// Store Picker 
var StorePicker = React.createClass({

  history: createHistory(),
  //custom functions
  goToStore: function (event) {
    event.preventDefault();
    //get data from value
    var storeId = this.refs.storeId.value;
    <Redirect to={{ pathname: this.history.push('/store/' + storeId) }} />

  },

  render: function () {
    return (
      <form action="" className="store-selector" onSubmit={this.goToStore}>
        {/*store id*/}
        <h2>Please Enter a Store ID</h2>
        <input type="text" ref="storeId" defaultValue={h.getFunName()} required />
        <input type="submit" />
      </form>
    );
  }

});




ReactDom.render(<AppRoute />, document.getElementById('main'));