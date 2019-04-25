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
            <a title="Network Browser" className="dropdown-item" href="#" onClick={this.addTab({
                                            component: 'NetworkBrowser',
                                            title: 'Network Browser'
                                })}> <FontAwesomeIcon icon="sitemap" /> Network Browser</a>  

            <a title="Network Audit" className="dropdown-item" href="#" onClick={this.addTab({
                                                component: 'NetworkAudit',
                                                title: 'Network Audit'
                                })}><FontAwesomeIcon icon="wrench"/> Network Audit</a>

            <a title="Managed Object Browser" className="dropdown-item" href="#" onClick={this.addTab({
                                        component: 'MOBrowser',
                                        title: 'MO Browser'})}><FontAwesomeIcon icon="puzzle-piece"/> MO Browser</a>

            <a title="Network Baseline" className="dropdown-item" href="#" onClick={this.addTab({
                                            component: 'NetworkBaseline',
                                            title: 'Network Baseline'
                                })}> <FontAwesomeIcon icon="stop-circle"/>  Network Baseline</a>

            <a title="Telecom Library" className="dropdown-item" href="#" onClick={this.addTab({
                                                component: 'TelecomLib',
                                                title: 'Telecom Library'
                                })}> <FontAwesomeIcon icon="university"/>  Telecom Library</a>
                                
                <span className="dropdown-item-text legend w-100">Service Assurance</span>
                <a className="dropdown-item text-muted" title="Reports" href="#" onClick={this.addTab({
                                component: 'Reports',
                                title: 'Reports'
                                })}> <FontAwesomeIcon icon="chart-area"/>  Reports</a>
                <a className="dropdown-item text-muted" title="Self Network Optimisation Functions" href="#" > <FontAwesomeIcon icon="brain"/>  SON</a>
                <a className="dropdown-item text-muted" href="#" title="Customer Experience Management"> <FontAwesomeIcon icon="gem"/>  CEM</a>
                <a className="dropdown-item text-muted" href="#" title="Fault Management" > <FontAwesomeIcon icon="user-md"/>  Faults</a>
                <a className="dropdown-item text-muted" href="#" title="Geo-Location"> <FontAwesomeIcon icon="globe-africa"/>  Geo-Location</a>
                <a className="dropdown-item text-muted" href="#" title="Works Authorisation"> <FontAwesomeIcon icon="people-carry"/>  WorkFlow</a>
                <span className="dropdown-item-text legend w-100">System</span>
                <a className="dropdown-item" href="#" title="Processes" onClick={this.addTab({
                                component: 'Processes', title: 'Processes'})}> <FontAwesomeIcon icon="cogs"/>  Processes</a>
                                
                <a className="dropdown-item" href="#" title="Settings" onClick={this.addTab({
                            component: 'Settings', title: 'Settings'})}><FontAwesomeIcon icon="cog"/> Settings</a>
                            
                <a className="dropdown-item" title="Profile" href="#" 
                    onClick={this.addTab({ component: 'UserProfile', title:'Profile'})}>
                    <FontAwesomeIcon icon="user"/> Profile</a>
                                
                <a className="dropdown-item" href="#" title="Help" onClick={this.addTab({
                                component: 'Help', title: 'Help'})}><FontAwesomeIcon icon="question-circle"/>  Help</a>
        </div>
        );
        
    }
}


export default connect()(DashboardSidePanel);
