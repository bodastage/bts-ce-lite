import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setSidePanel, addTab } from '../layout/uilayout-actions';

class Settings extends React.Component{
    static icon = "cog";
    static label = "Settings";
    constructor(props){
        super(props);
        
        this.showCMLeftPanel = this.showCMLeftPanel.bind(this);
    }
    
    showCMLeftPanel(){
         this.props.dispatch(setSidePanel('CMSettingsOptions'));
    }
	
    addTab = (options) => (e) => { 
        e.preventDefault();

        let tabId = options.component;
        this.props.dispatch(addTab(tabId, options.component, {title: options.title}));
    }
    
    render(){
        return (
            <div>
				
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend"><FontAwesomeIcon icon="cog"/> Settings</legend>
                    
                 
				
				</fieldset>
            </div>
        );
    }
}

export default connect()(Settings);