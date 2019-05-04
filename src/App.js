import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const DEFAULT_QUERY = 'redux';
const proxyurl = 'https://cors-anywhere.herokuapp.com/';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

// ES5
// var url = PATH_BASE + PATH_SEARCH + '?' + PARAM_SEARCH + DEFAULT_QUERY;

// ES6
// const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`;


// Sample list
// const list = [
//   {
//     title: 'React',
//     url: 'https://reactjs.org',
//     author: 'Jordan Walke',
//     num_comments: 3,
//     points: 4,
//     objectID: 0
//   },
//   {
//     title: 'Redux',
//     url: 'https://redux.js.org/',
//     author: 'Dan Abramov, Andrew Clark',
//     num_comments: 2,
//     points: 5,
//     objectID: 1
//   }
// ];


//ES5
// function isSearched(searchTerm) {
//   return function (item){
//     return item.title.toLowerCase().includes(searchTerm.toLowerCase());
//   }
// }

//ES6
//returns all item.titles that include the searchterm
// const isSearched = searchTerm => item => 
//   item.title.toLowerCase().includes(searchTerm.toLowerCase());

// ES6 Class Component
class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY
    }

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  setSearchTopStories(result) {
    this.setState({result});
  }

  fetchSearchTopStories(searchTerm) {
    fetch(`${proxyurl}${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
    .then(response => response.json())
    .then(result => this.setSearchTopStories(result))
    .catch(error => error);
  }

  componentDidMount() {
    const {searchTerm} = this.state;
    this.fetchSearchTopStories(searchTerm);
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.fetchSearchTopStories(searchTerm);
    event.preventDefault();
  }

  onSearchChange(event) {
    this.setState({searchTerm: event.target.value});
  }
  onDismiss(id) {

    //ES5
    // function isNotId(item){
    //   return item.objectID !== id;
    // }

    //ES6
    //return items that do not match id in the argument
    const isNotId = item => item.objectID !==id;
    //make new list that has all items that do not have the argument id
    const updatedHits = this.state.result.hits.filter(isNotId);
    //update state of orginal hits to new hits using object spread operator '...'
    this.setState({
      result: {...this.state.result, hits: updatedHits}
    });
  }


  render() {
    console.log(this.state);
    //destructuring local state object
    // ES5
    // var searchTerm = this.state.searchTerm;
    // var list = this.state.list;

    // ES6 destructuring
    const { searchTerm, result} = this.state;

    // conditional render
    if (!result) { return null; }
    
    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        {/* terniary operator. if result is true, render table */}
        {result &&
           <Table
            list={result.hits}
            onDismiss={this.onDismiss} 
          />
        }
      </div>
    );
  }
}

// function stateless component
// implicit return
const Search = ({ value, onChange, onSubmit, children}) => 

    //props destructured in function signature instead
    // const { value, onChange, onSubmit children} = props;
    
      <form onSubmit={onSubmit}>
      <input 
      type="text" 
      value={value} 
      onChange={onChange}
      />
      <button type="submit">
        {children}
      </button>
    </form>

// functional stateless component
// explicit return arrow function
const Table = ({list, pattern, onDismiss}) => {

  // do some code

  const largeColumn = {
    width: '40%'
  };

  const midColumn = {
    width: '30%'
  };

  const smallColumn = {
    width: '10%'
  };

  return ( 
    <div className="table">
      {list.map(item => 
        <div key={item.objectID} className="table-row">
          <span style={largeColumn}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={midColumn}>{item.author}</span>
          <span style={smallColumn}>{item.points}</span>
          <span style={smallColumn}>{item.num_components}</span>
          <span style={smallColumn}>
            {/* always put arrow function inside even handler */}
            <Button 
            onClick={()=> onDismiss(item.objectID)} 
            className="button-inline">
            Dismiss
            </Button>
          </span>
        </div>
      )}
    </div>
  ); 
}

// functional stateless component
// implicit return arrow function
const Button = ({onClick, className, children}) => 

    <button 
      onClick={onClick}
      className={className}
      type="button"
    >
    {children}
    </button>


export default App;
