import React from 'react'
import ReactDom from 'react-dom'
import { Provider } from 'react-redux'                                                                                                                                                 
import App from './containers/app'
import store from './state/store'


ReactDom.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('tetris'))
