import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import  './dashboard.css';
import { connect } from 'react-redux';
import { addTab, setSidePanel } from '../layout/uilayout-actions';
import { checkIfJavaIsInstalled, clearNotice } from './dashboard-actions';
import { Toaster, ToasterPosition, Intent, OverlayToaster } from "@blueprintjs/core";

//const { shell } = window.require('electron').remote;
// const { shell } = window.require('electron'); 
//btslite_api.shellOpenPath

//const log = window.require('electron-log');
//const fs = window.require('fs');

class Dashboard extends React.Component {
    
    static icon = "home";
    static label = "Home"
    
    constructor(props: any){
        super(props);
        
        this.addTab = this.addTab.bind(this);
		this.setSidePanel = this.setSidePanel.bind(this);
		
		this.toaster = Toaster;
		
		const that = this;
		
		//Check if Java is installed
		setTimeout(() => {
			that.props.dispatch(checkIfJavaIsInstalled());
		},1000);
		

    }
    
    toaster = null;

    refHandlers = {
        toaster: (ref) => (this.toaster = ref),
    };

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
		// const logPath = log.transports.file.findLogPath()
		// if (!fs.existsSync(logPath)) {
		// 	log.warn(`[dashboard] ${logPath} does not exist.`)
		// 	this.toaster.show({
        //         icon: "info-sign",
        //         intent: Intent.WARNING,
        //         message: `${logPath} does not exist.`,
		// 	});
		// 	return;
		// }
		//shell.openPath(logPath)
        btslite_api.shellOpenPath(logPath);

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
	
	dismissNotice = () => {
		this.props.dispatch(clearNotice());
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
	
		let notice = null;
		if(this.props.notice !== null ){ 
			notice = (<div className={`alert alert-${this.props.notice.type} p-2 mt-2`} role="alert">{this.props.notice.message}
					<button type="button" className="btn-close right float-end" data-bs-dismiss="alert" aria-label="Close" onClick={this.dismissNotice}></button>
			</div>)
		}
		
        return (

            <div>
				{notice}
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

                <OverlayToaster {...this.state} ref={this.refHandlers.toaster} />
            </div>
        );
    }
    
}

function mapStateToProps(state) {
  return {
	  notice: state.dashboard.notice
  }
}

export default connect(mapStateToProps)(Dashboard);