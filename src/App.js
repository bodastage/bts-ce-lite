import React from 'react';
import configureStore from './configure-store';
import LoginForm from './modules/session/LoginForm';
import UILayout from './modules/layout/UILayout';
import { connect } from 'react-redux';
import ErrorBoundary from './modules/layout/ErrorBoundary';
import VERSION from './version';
import { logOutOfApp, resetState, clearSQLiteDB } from './modules/session/session-actions'


const log = window.require('electron-log');

class App extends React.Component {
  constructor(props){
      super(props);
	  this.state = { error: null, errorInfo: null };
  }
  
  async componentDidMount(){
	  //Recreate sqlitedb if it is 0
	  //this.props.dispatch(clearSQLiteDB());
	  
	  //@TODO: Reset state if the version is different
	  if(VERSION !== this.props.version){
			this.props.dispatch(resetState());
	  }
  }
  
  componentDidCatch(error, errorInfo) {
	
	this.setState({
	  error: error,
	  errorInfo: errorInfo
	});
  }
  
  render() {
	  
        if (this.props.authenticated === false) {
            return (
				<ErrorBoundary>
					<LoginForm/>
				</ErrorBoundary>
				);
        }
        
        return (
			<ErrorBoundary>
				<UILayout/>
			</ErrorBoundary>
		);
  }
}

function mapStateToProps(state) {
  return {
    authenticated: state.session.authenticated,
	version: state.session.version
  }
}

export default connect(mapStateToProps)(App);