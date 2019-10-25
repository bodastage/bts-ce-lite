import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import  './dashboard.css';
import { connect } from 'react-redux';
import { addTab, setSidePanel } from '../layout/uilayout-actions';
import { Toaster, Intent } from "@blueprintjs/core";

const { shell } = window.require('electron').remote;
const log = window.require('electron-log');
const fs = window.require('fs');

class Dashboard extends React.Component {
    
    static icon = "home";
    static label = "Home"
    
    constructor(props){
        super(props);
        
        this.addTab = this.addTab.bind(this);
		this.setSidePanel = this.setSidePanel.bind(this);
		
		this.toaster = new Toaster();

    }
    
    addTab = (options) => (e) => { 
        e.preventDefault();

        let tabId = options.component;
        this.props.dispatch(addTab(tabId, options.component, {title: options.title}));
    }
	
	setSidePanel = (sidePanel) => (e) => { 
		e.preventDefault();
		
		this.props.dispatch(setSidePanel(sidePanel));
	}
	
	showLogFile = (e) => {
		const logPath = log.transports.file.findLogPath()
		if (!fs.existsSync(logPath)) {
			log.warn(`[dashboard] ${logPath} does not exist.`)
			this.toaster.show({
                icon: "info-sign",
                intent: Intent.WARNING,
                message: `${logPath} does not exist.`,
			});
			return;
		}
		shell.openItem(logPath)
	}
	
	/**
	* Load baseline module
	*/
	showBaseLineModule= (options) => (e) => { 
		e.preventDefault();
		let tabId = options.component;
        this.props.dispatch(addTab(tabId, options.component, {title: options.title}));
	}
	
	
	/**
	* Load baseline module
	*/
	showParameterLibrary= (options) => (e) => { 
		e.preventDefault();
		let tabId = options.component;
        this.props.dispatch(addTab(tabId, options.component, {title: options.title}));
	}
    
	showGISModule= (options) => (e) => { 
        e.preventDefault();
		//show main map
        let tabId = options.component;
        this.props.dispatch(addTab(tabId, options.component, {title: options.title}));
		
		//@TODO: Disable GIS side panel for now as we figure out what to add
		//Show side panel
		//this.props.dispatch(setSidePanel('GISLeftPanel'));
	}
	
    render(){   
        return (

            <div>
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend">Radio Access Network</legend>
                    
                        <div className="row dashboard-icon">
                            <div className="col-md-2">
                            <div className="icon-display"><a title="Process CM dumps" href="#/parsecmdumps" 
                                onClick={this.addTab({
                                component: 'ParseAndImport',
                                title: 'Parse and Import'
                                })}> <FontAwesomeIcon icon="asterisk"/></a></div>
                                <div className="icon-label">Parse and Import</div>
                            </div>

                            <div className="col-md-2">
								<div className="icon-display"><a title="Reports" href="#/reports" 
									onClick={this.setSidePanel('ReportsTree')}> 
									<FontAwesomeIcon icon="table"/></a></div>
                                <div className="icon-label">Reports</div>
                            </div>
							
                            <div className="col-md-2">
								<div className="icon-display"><a title="GIS" href="#/gis" 
									onClick={this.showGISModule({
                                component: 'GISMap',
                                title: 'GIS'
                                })}> 
									<FontAwesomeIcon icon="globe-africa"/></a></div>
                                <div className="icon-label">GIS</div>
                            </div>

                            <div className="col-md-2">
								<div className="icon-display"><a title="GIS" href="#/baseline" 
									onClick={this.showBaseLineModule({
                                component: 'Baseline',
                                title: 'Baseline Audit'
                                })}> 
									<FontAwesomeIcon icon="pencil-ruler"/></a></div>
                                <div className="icon-label">Baseline Audit</div>
                            </div>

                            <div className="col-md-2">
								<div className="icon-display"><a title="GIS" href="#/parameterlibrary" 
									onClick={this.showParameterLibrary({
                                component: 'ParameterLibrary',
                                title: 'Parameter Reference'
                                })}> 
									<FontAwesomeIcon icon="book"/></a></div>
                                <div className="icon-label">Parameter Reference</div>
                            </div>
                            
                            <div className="col-md-2">
                            </div>
                        </div>        

                </fieldset>		
				

                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend">Utilities</legend>
                    
                    <div className="row dashboard-icon">

                        <div className="col-md-2">
                            <div className="icon-display">
								<a 
									title="CSV to Excel" 
									href="#/#" 
									onClick={this.addTab({
										component: 'CSVToExcelCombiner',
										title: 'CSV to Excel'
									})}>
									<FontAwesomeIcon icon="file-excel"/>
								</a></div>
                            <div className="icon-label">CSV to Excel</div>
                        </div>
						
                        <div className="col-md-2">
                            <div className="icon-display">
								<a 
									title="KML Generator" 
									href="#/#" 
									onClick={this.addTab({
										component: 'KMLGenerator',
										title: 'KML Generator'
									})}>
									<FontAwesomeIcon icon="globe"/>
								</a></div>
                            <div className="icon-label">KML Generator</div>
                        </div>

                        <div className="col-md-2">

                        </div>

                        <div className="col-md-2">

                        </div>
						
                        <div className="col-md-2">
                        </div>
                    </div>
                </fieldset>
               
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend">System</legend>
                    
                    <div className="row dashboard-icon">

                        <div className="col-md-2">
                            <div className="icon-display"><a title="Profile" href="#/profile" onClick={this.addTab({
                        component: 'UserProfile', 
                        title:'Profile'})}><FontAwesomeIcon icon="user"/></a></div>
                            <div className="icon-label">Profile</div>
                        </div>

                        <div className="col-md-2">
                            <div className="icon-display"><a title="Help" href="#/help" onClick={this.addTab({
                                component: 'Help', title: 'Help'})}><FontAwesomeIcon icon="question-circle"/></a></div>
                            <div className="icon-label">Help</div>
                        </div>

                        <div className="col-md-2">
                            <div className="icon-display"><a title="Log file" href="#/" onClick={this.showLogFile.bind(this)}><FontAwesomeIcon icon="file-alt"/></a></div>
                            <div className="icon-label">Log file</div>
                        </div>

                        <div className="col-md-2">
                            <div className="icon-display"><a title="Help" href="#/settings" onClick={this.addTab({
                                component: 'Settings', title: 'Settings'})}><FontAwesomeIcon icon="cog"/></a></div>
                            <div className="icon-label">Settings</div>
                        </div>
						
                        <div className="col-md-2">
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