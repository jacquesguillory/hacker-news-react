import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import classNames from 'classnames';
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


//Sorting functions using lodash library
const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'tltle'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse()
};


// ES6 Class Component
class App extends Component {

  //constructor sets up the react state and binds functions
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
      sortKey: 'TITLE',
      isSortReverse: false
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  //--------Functions for our App Component--------

  //changes state of sortKey so that lodash sorting functions can be retrieved
  //checks if incoming sortKey is the same as current sortKey. if so, it switches state of isSortReverse
  onSort(sortKey) {

    let isSortReverse = this.state.isSortReverse;
    if(sortKey === this.state.sortKey){
      isSortReverse = !this.state.isSortReverse;
    }
    else {
      isSortReverse = false;
    }
    // const isSortReverse = this.state.sortkey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  //checking if a term was already searched and in the cache so you don't need to make an API call
  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  //adds new hits to old hits in the state, caching results
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
      },
      isLoading: false
    });

    console.log(this.state);
  }

  //calling hackernews api
  fetchSearchTopStories(searchTerm, page = 0) {

    //set loading state to true when fetching results
    this.setState({ isLoading: true });

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

  //rendering component
  render() {
    // console.log(this.state);
    // console.log(this.state);
    //destructuring local state object
    // ES5
    // var searchTerm = this.state.searchTerm;
    // var list = this.state.list;

    // ES6 destructuring
    const { searchTerm, results, searchKey, error, isLoading, sortKey, isSortReverse} = this.state;
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
            sortKey={sortKey}
            isSortReverse={isSortReverse}
            onSort={this.onSort}
            onDismiss={this.onDismiss}
          /> 
        }  
        <div className="interactions">
          {/* this is the output component of a higher order component that decides whether to render the button component or loading component */}
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page +1)}>
                More
          </ButtonWithLoading>
        </div>
      </div>
    );
  }
}

// ES6 class component
class Search extends Component {

  //focusing the input field when component mounts using 'this'
  //to reference DOM element with the 'ref' attribute
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }

  render() {
    const { value, onChange, onSubmit, children } = this.props;

    return (
    
      <form onSubmit={onSubmit}>
      <input 
      type="text" 
      value={value} 
      onChange={onChange}
      //referencing DOM with the ref attribute
      ref={el => this.input = el}
      />
      <button type="submit">
        {children}
      </button>
      </form>
    );
  }
}

// functional stateless component
// explicit return arrow function
const Table = ({list, pattern, sortKey, isSortReverse, onSort, onDismiss}) => {

  const sortedList = SORTS[sortKey](list);
  //if isSortReverse is true, reverse sortedList. if false, leave list as is
  const reverseSortedList = isSortReverse
    ? sortedList.reverse()
    : sortedList;



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
      <div className="table-header">
        <span style={{ width: '40%' }}>
          <Sort 
            sortKey={'TITLE'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Title
          </Sort>
        </span>
        <span style={{ width: '30%' }}>
          <Sort 
            sortKey={'AUTHOR'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Author
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort 
            sortKey={'COMMENTS'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Comments
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort 
            sortKey={'POINTS'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Points
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          Archive
        </span>
      </div>
      {reverseSortedList.map(item => 
        <div key={item.objectID} className="table-row">
          <span style={largeColumn}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={midColumn}>{item.author}</span>
          <span style={smallColumn}>{item.num_comments}</span>
          <span style={smallColumn}>{item.points}</span>
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

//PropTypes describe the component interface. All the props passed from a parent component 
//to a child get validated based on the PropTypes interface assigned to the child.
//isRequired means these props must be defined
Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

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

//default props can be defined in the component
Button.defaultProps = {
  className: ''
};

//PropTypes describe the component interface. All the props passed from a parent component 
//to a child get validated based on the PropTypes interface assigned to the child.
//isRequired means these props must be defined
Button.propTypes = {
  onclick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

// implicit return component
const Loading = () =>
  <div>
    Loading results...
  </div>

//example of a higher order component, similar to a higher order function
//conditional render of component depending on if props.isLoading is true
//conventional prefix of a HOC is 'with'
//first, destructure isLoading prop from rest of props
const withLoading = (Component) => ({ isLoading, ...rest }) =>
  isLoading
    ? <Loading />
    : <Component {...rest} />

//Button component is the input component of the HOC
//enhanced output component is a ButtonWithLoading component
const ButtonWithLoading = withLoading(Button);

//Sorting component for table header
//Has button component with sorting methods as properties
const Sort = ({ sortKey, activeSortKey, onSort, children }) => {

  //Distinguishing which column is actively sorted using classnames library
  //define className with conditional classes
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey}
  );

  // alternative code without classnames library
  // const sortClass = ['button-inline'];
  // if(sortKey=== activeSortKey) {
  //   sortClass.push('button-active');
  // }
  
  return (
    <Button
      onClick={() => onSort(sortKey)}
      className={sortClass}
    >
      {children}
    </Button>
  );
}
export default App;

export {
  Button,
  Search,
  Table
};
