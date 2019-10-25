import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import  './dashboard.css';
import { connect } from 'react-redux';
import { addTab, setSidePanel } from '../layout/uilayout-actions';
import { Intent   } from "@blueprintjs/core";

const log = window.require('electron-log');
const { shell } = window.require('electron').remote;
const fs = window.require('fs');

class DashboardSidePanel extends React.Component {
    constructor(props){
        super(props);
        
        this.addTab = this.addTab.bind(this);
		this.setSidePanel = this.setSidePanel.bind(this);

    }
    
	showLogFile = (e) => {
		e.preventDefault();
		
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
	
    addTab = (options) => (e) => { 
        e.preventDefault();

        let tabId = options.component;
        this.props.dispatch(addTab(tabId, options.component, {title: options.title}));
    }
    
	
	setSidePanel = (sidePanel) => (e) => { 
		e.preventDefault();
		
		this.props.dispatch(setSidePanel(sidePanel));
	}
	
    render(){
        return (
        <div>
            <span className="dropdown-item-text legend w-100">Radio Access Network</span>
            <a title="Process CM dumps" className="dropdown-item" href="/#" onClick={this.addTab({
                                            component: 'ParseAndImport',
                                            title: 'Parse and Import'
                                })}> <FontAwesomeIcon icon="asterisk" /> Parse and Import</a>  

            <a title="Reports" className="dropdown-item" href="/#" onClick={this.setSidePanel('ReportsTree')}> <FontAwesomeIcon icon="table"/> Reports</a>
			
            <a title="GIS" className="dropdown-item" href="/#" onClick={this.addTab({
                                            component: 'GISMap',
                                            title: 'GIS'
                                })}> <FontAwesomeIcon icon="globe-africa" /> GIS</a>  
           
		   
            <a title="Baseline" className="dropdown-item" href="/#" onClick={this.addTab({
                                            component: 'Baseline',
                                            title: 'Baseline Audit'
                                })}> <FontAwesomeIcon icon="pencil-ruler" /> Baseline</a>  
								
						
            <a title="Parameter Reference" className="dropdown-item" href="/#" onClick={this.addTab({
                                            component: 'ParameterLibrary',
                                            title: 'Parameter Reference'
                                })}> <FontAwesomeIcon icon="book" /> Parameter Reference</a>  
								
					
						
                <span className="dropdown-item-text legend w-100">Utilities</span>
				
						
            <a title="CSV to Excel" className="dropdown-item" href="/#" onClick={this.addTab({
                                            component: 'CSVToExcelCombiner',
                                            title: 'CSV to Excel'
                                })}> <FontAwesomeIcon icon="file-excel" /> CSV to Excel</a>  
								
            <a title="KML Generator" className="dropdown-item" href="/#" onClick={this.addTab({
                                            component: 'KMLGenerator',
                                            title: 'KML Generator'
                                })}> <FontAwesomeIcon icon="file-excel" /> KML Generator</a>  
								
								
						
                <span className="dropdown-item-text legend w-100">System</span>

                <a className="dropdown-item" title="Profile" href="/#" 
				onClick={this.addTab({
                        component: 'UserProfile', 
                        title:'Profile'})}
                    >
                    <FontAwesomeIcon icon="user"/> Profile</a>
                                
                <a className="dropdown-item" href="/#" title="Help" onClick={this.addTab({
                                component: 'Help', title: 'Help'})}><FontAwesomeIcon icon="question-circle"/>  Help</a>
								
			<a className="dropdown-item" title="Log file" href="/#" onClick={this.showLogFile.bind(this)}><FontAwesomeIcon icon="file-alt"/> Log file</a>
                                
                <a className="dropdown-item" href="/#" title="Settings" onClick={this.addTab({
                                component: 'Settings', title: 'Settings'})} ><FontAwesomeIcon icon="cog"/>  Settings</a>
        </div>
        );
        
    }
}


export default connect()(DashboardSidePanel);
