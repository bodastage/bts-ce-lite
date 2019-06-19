import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import  './dashboard.css';
import { connect } from 'react-redux';
import { addTab } from '../layout/uilayout-actions';

class DashboardSidePanel extends React.Component {
    constructor(props){
        super(props);
        
        this.addTab = this.addTab.bind(this);

    }
    
    addTab = (options) => (e) => { 
        e.preventDefault();

        let tabId = options.component;
        this.props.dispatch(addTab(tabId, options.component, {title: options.title}));
    }
    
    render(){
        return (
        <div>
            <span className="dropdown-item-text legend w-100">Radio Access Network</span>
            <a title="Process CM dumps" className="dropdown-item" href="#" onClick={this.addTab({
                                            component: 'ProcessCMDumps',
                                            title: 'Process CM dumps'
                                })}> <FontAwesomeIcon icon="asterisk" /> Process CM dumps</a>  

            <a title="Reports" className="dropdown-item" href="#" ><FontAwesomeIcon icon="table"/> Reports</a>



                                
                <span className="dropdown-item-text legend w-100">System</span>

                <a className="dropdown-item" title="Profile" href="#" 
				onClick={this.addTab({
                        component: 'UserProfile', 
                        title:'Profile'})}
                    >
                    <FontAwesomeIcon icon="user"/> Profile</a>
                                
                <a className="dropdown-item" href="#" title="Help" onClick={this.addTab({
                                component: 'Help', title: 'Help'})}><FontAwesomeIcon icon="question-circle"/>  Help</a>
								
                                
                <a className="dropdown-item" href="#" title="Settings" onClick={this.addTab({
                                component: 'Settings', title: 'Settings'})}><FontAwesomeIcon icon="cog"/>  Settings</a>
        </div>
        );
        
    }
}


export default connect()(DashboardSidePanel);
