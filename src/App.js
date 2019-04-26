import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


const list = [
  {
    title: 'React',
    url: 'https://reactjs.org',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1
  }
];


//ES5
// function isSearched(searchTerm) {
//   return function (item){
//     return item.title.toLowerCase().includes(searchTerm.toLowerCase());
//   }
// }

//ES6
//returns all item.titles that include the searchterm
const isSearched = searchTerm => item => 
  item.title.toLowerCase().includes(searchTerm.toLowerCase());


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      list, //same as list: list
      searchTerm: '',
    }

    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
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
    const updatedList = this.state.list.filter(isNotId);
    //update state of orginal list to new list
    this.setState({list: updatedList});
  
  }


  render() {
    
    //destructuring local state object
    // ES5
    // var searchTerm = this.state.searchTerm;
    // var list = this.state.list;

    // ES6 destructuring
    const { searchTerm, list} = this.state;
    
    return (
      <div className="App">

        <Search
          value={searchTerm}
          onChange={this.onSearchChange}
        >
          Search
        </Search>
        <Table
          list={list}
          pattern={searchTerm}
          onDismiss={this.onDismiss} 
        />
      </div>
    );
  }
}

class Search extends Component {
  render(){
    const { value, onChange, children} = this.props;
    
    return (
      <form>
      {children} <input 
      type="text" 
      value={value} 
      onChange={onChange}
      />
    </form>
    );
  }
}

class Table extends Component {
  render() {

    const {list, pattern, onDismiss} = this.props;

    return (


      
      <div>
        {list.filter(isSearched(pattern)).map(item => 

          <div key={item.objectID}>
            <span>
              <a href={item.url}>{item.title}</a>
            </span>
            <span>{item.author}</span>
            <span>{item.num_components}</span>
            <span>{item.points}</span>
            <span>
              {/* always put arrow function inside even handler */}
              <button 
              onClick={()=> onDismiss(item.objectID)} 
              type="button">
              Dismiss
              </button>
            </span>
          </div>
        )}
      </div>
    ); 
  }
}

export default App;
