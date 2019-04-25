import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import  './dashboard.css';
import { connect } from 'react-redux';
import { addTab } from '../layout/uilayout-actions';
import { Icon } from "@blueprintjs/core";

class Dashboard extends React.Component {
    
    static icon = "home";
    static label = "Home"
    
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
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend">Radio Access Network</legend>
                    
                        <div className="row dashboard-icon">
                            <div className="col-md-2">
                                <div className="icon-display"><a title="Network Browser" href="#/netmgt" 
                                onClick={this.addTab({
                                component: 'NetworkBrowser',
                                title: 'Network Browser'
                                })}> <FontAwesomeIcon icon="sitemap" /></a></div>
                                <div className="icon-label">Network Browser</div>
                            </div>

                            <div className="col-md-2">
                                <div className="icon-display" title="Network Audit Module"><a title="Network Audit" href="#/netaudit" 
                                onClick={this.addTab({
                                    component: 'NetworkAudit',
                                    title: 'Network Audit'
                                })}><FontAwesomeIcon icon="wrench"/></a></div>
                                <div className="icon-label">Network Audit</div>
                            </div>
                            <div className="col-md-2">
                                <div className="icon-display"><a href="#/mobrowser" title="Managed Object Browser" 
                                onClick={this.addTab({
                                    component: 'MOBrowser',
                                    title: 'MO Browser'})}> <FontAwesomeIcon icon="puzzle-piece"/></a></div>
                                <div className="icon-label">MO Browser</div>
                            </div>

                            <div className="col-md-2">
                            <div className="icon-display"><a title="Telecom Library" href="#/telecomlib" 
                                onClick={this.addTab({
                                component: 'TelecomLib',
                                title: 'Telecom Library'
                                })}> <FontAwesomeIcon icon="university"/></a></div>
                                <div className="icon-label">Telecom Library</div>
                            </div>

                            <div className="col-md-2">
                            <div className="icon-display"><a title="Reports" href="#/reports" 
                                onClick={this.addTab({
                                component: 'Reports',
                                title: 'Reports'
                                })}> <FontAwesomeIcon icon="table"/></a></div>
                                <div className="icon-label">Reports</div>
                            </div>
                            
                            <div className="col-md-2">
                            </div>
                        </div>        

                </fieldset>		
               
                
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend">Service Assurance</legend>
                    
                    <div className="row dashboard-icon">
                        <div className="col-md-2">
                            <div className="icon-display"><a title="Performance" href="#" className="text-muted"><FontAwesomeIcon icon="chart-line"/></a></div>
                            <div className="icon-label">Performance</div>
                        </div>

                        <div className="col-md-2">
                            <div className="icon-display "><a title="Self Optimization Network Functions" href="#" className="text-muted" ><FontAwesomeIcon icon="brain"/></a></div>
                            <div className="icon-label">SON</div>
                        </div>

                        <div className="col-md-2">
                            <div className="icon-display "><a title="Customer Experience Managemenet" href="#" className="text-muted" ><FontAwesomeIcon icon="gem"/></a></div>
                            <div className="icon-label">CEM</div>
                        </div>

                        <div className="col-md-2">
                            <div className="icon-display "><a title="Fault Managemenet" href="#" className="text-muted" ><FontAwesomeIcon icon="user-md"/></a></div>
                            <div className="icon-label">Faults</div>
                        </div>

                        <div className="col-md-2">
                            <div className="icon-display "><a title="Geo-Location" href="#" className="text-muted" ><FontAwesomeIcon icon="globe-africa"/></a></div>
                            <div className="icon-label">Geo-Location</div>
                        </div>
                        

                        <div className="col-md-2">
                            <div className="icon-display "><a title="Works Authorisation" href="#" className="text-muted" ><FontAwesomeIcon icon="people-carry"/></a></div>
                            <div className="icon-label">WorkOrders</div>
                        </div>
                    </div>
 
                </fieldset>
                
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend">System</legend>
                    
                    <div className="row dashboard-icon">
                        <div className="col-md-2">
                            <div className="icon-display"><a title="Processes" href="#/processes" onClick={this.addTab({
                                component: 'Processes', title: 'Processes'})}><FontAwesomeIcon icon="cogs"/></a></div>
                            <div className="icon-label">Processes</div>
                        </div>

                        <div className="col-md-2">
                            <div className="icon-display"><a title="Profile" href="#/profile" onClick={this.addTab({
                                component: 'UserProfile', title:'Profile'})}><FontAwesomeIcon icon="user"/></a></div>
                            <div className="icon-label">Profile</div>
                        </div>

                        <div className="col-md-2">
                        <div className="icon-display"><a title="Settings" href="#" onClick={this.addTab({
                            component: 'Settings', title: 'Settings'})}><FontAwesomeIcon icon="cog"/></a></div>
                            <div className="icon-label">Settings</div>
                        </div>

                        <div className="col-md-2">
                            <div className="icon-display"><a title="Help" href="#/help" onClick={this.addTab({
                                component: 'Help', title: 'Help'})}><FontAwesomeIcon icon="question-circle"/></a></div>
                            <div className="icon-label">Help</div>
                        </div>
                    </div>
                </fieldset>
            </div>
        );
    }
    
}

//function mapStateToProps(state) {
//  return {
//    tabs: state.tabs
//  }
//}
//
//export default connect(mapStateToProps)(Dashboard);
    
export default connect()(Dashboard)