import React from 'react'
import { Intent, Button, Classes } from "@blueprintjs/core";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const log = window.require('electron-log');

export default  class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

	componentDidCatch(error, info) {
		log.info(error.toString());
	}
  
	resetState = () => { 
	
		//@TODO: Clear states via redux action
		window.localStorage.clear();
		window.location.reload();
	}

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (<div>
			    <div style={{"text-align":"center"}} className="p-2">
					<FontAwesomeIcon icon="frown" size="6x" className={Classes.INTENT_WARNING}/>
				</div>
				
				<div style={{"text-align":"center"}} className="p-2">
				Oops! This is embarrasing. We appear to have run into an issue.  
						Please share the log file and a description of what you were doing  when this occured with the boda-lite team to help us improve the app.
				</div>
				
				<div style={{"text-align":"center"}} className="p-2">
					<Button 
					large={true} 
					text="Reset App" 
					rightIcon="refresh" intent={Intent.WARNING} 
					onClick={this.resetState.bind(this)}>
					</Button>
				</div>
			</div>);
    }

    return this.props.children; 
  }
}