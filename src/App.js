import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const proxyurl = 'https://cors-anywhere.herokuapp.com/';
const PATH_BASE = 'https://hn.algolia.com/api/v1';

//error testing
// const PATH_BASE = 'https://hn.mydomain.com/api/v1';

const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage='

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
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  //checking if a term was already searched and in the cache so you don't need to make an API call
  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];
    
    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page}
      }
    })

    console.log(this.state);
  }

  //calling hackernews api
  fetchSearchTopStories(searchTerm, page = 0) {
    axios(`${proxyurl}${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(result => this.setSearchTopStories(result.data))
    .catch(error => this.setState({ error }));
  }

  //when component mounts, do api search
  componentDidMount() {
    const {searchTerm} = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  //when submitting a new search, run fetch function
  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm});

    //don't call API if searchterm already exists, use cached data instead
    if(this.needsToSearchTopStories(searchTerm)){
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  //change state search term every time an input is changed in search box
  onSearchChange(event) {
    this.setState({searchTerm: event.target.value});
  }
  onDismiss(id) {

    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    //ES5
    // function isNotId(item){
    //   return item.objectID !== id;
    // }

    //ES6
    //return items that do not match id in the argument
    const isNotId = item => item.objectID !==id;
    //make new list that has all items that do not have the argument id
    const updatedHits = hits.filter(isNotId);
    //update state of orginal hits to new hits using object spread operator '...'
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }


  render() {
    // console.log(this.state);
    // console.log(this.state);
    //destructuring local state object
    // ES5
    // var searchTerm = this.state.searchTerm;
    // var list = this.state.list;

    // ES6 destructuring
    const { searchTerm, results, searchKey, error} = this.state;
    const page = (
      results &&
      results[searchKey] && 
      results[searchKey].page
      ) || 0;
    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];

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
        { error
          ? <div className="interactions">
            <p>Something went wrong.</p>
          </div>
          : <Table
            list={list}
            onDismiss={this.onDismiss}
          /> 
        }  
        <div className="interactions">
          <Button onClick={() => this.fetchSearchTopStories(searchKey, page +1)}>
            More
          </Button>
        </div>
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
  //styling with variables
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

export {
  Button,
  Search,
  Table
};
