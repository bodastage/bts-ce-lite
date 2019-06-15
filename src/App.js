import React from 'react';
import configureStore from './configure-store';
import LoginForm from './modules/session/LoginForm';
import UILayout from './modules/layout/UILayout';
import { connect } from 'react-redux';
import ErrorBoundary from './modules/layout/ErrorBoundary';

const log = window.require('electron-log');

class App extends React.Component {
  constructor(props){
      super(props);
	  this.state = { error: null, errorInfo: null };
  }
  
  componentDidCatch(error, errorInfo) {
	log.info(error.toString());
	
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
    authenticated: state.session.authenticated
  }
}

export default connect(mapStateToProps)(App);