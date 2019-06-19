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
                <h3><FontAwesomeIcon icon="cog"/> Settings</h3>
                <div className="card">
                    <div className="card-body p-3">
                    <a href="#" className="launch-cm-menu" 
						onClick={this.addTab({
                        component: 'Database', 
                        title:'Database'})}><FontAwesomeIcon icon="arrow-right"/><span> Database</span></a>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect()(Settings);