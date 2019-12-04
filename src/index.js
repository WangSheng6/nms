
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './home/App';
import * as serviceWorker from './serviceWorker';
// 路由使用 history模式
import { HashRouter,Route } from 'react-router-dom';
// 路由采用 hash模式
// import { HashRouter } from 'react-router-dom'
import Home from './home/App'
import List from './list/List'
import Detail from './detail/Detail'

ReactDOM.render(
  <HashRouter>
    <Route exact path='/' component={Home}/>
    <Route exact path='/list' component={List}/>
    <Route exact path='/list/:id' component={Detail}/>
  </HashRouter>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
