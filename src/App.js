import React from 'react';
import configureStore from './configure-store';
import LoginForm from './modules/session/LoginForm';
import UILayout from './modules/layout/UILayout';
import { connect } from 'react-redux';

class App extends React.Component {
  constructor(props){
      super(props)
  }
  
  render() {
        return (<UILayout/>);
  }
}

function mapStateToProps(state) {
  return {
    authenticated: state.session.authenticated
  }
}

export default connect(mapStateToProps)(App);