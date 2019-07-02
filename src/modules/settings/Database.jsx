import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setSidePanel } from '../layout/uilayout-actions';
import { Button, Intent, ProgressBar, Dialog, Collapse, Classes, Icon, Callout } from "@blueprintjs/core";
import { updateDBSettings, getDBSettings, clearDBUpdateError, clearDBUpdateSuccess, 
		 checkConnection, showDBUpdateError, showDBUpdateSuccess, stopDBSettingsUpdate, 
		 startDBSettingsUpdate } from './settings-actions';

const path = window.require('path')
const { ipcRenderer} = window.require("electron")
const { app, process, shell } = window.require('electron').remote;

class Database extends React.Component{
    static icon = "database";
    static label = "Database";
    constructor(props){
        super(props);
        
        this.showCMLeftPanel = this.showCMLeftPanel.bind(this);
		this.updateDatabaseSetting = this.updateDatabaseSetting.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.testDBConnection = this.testDBConnection.bind(this);
		this.handleOnHrefClick = this.handleOnHrefClick.bind(this);
		
        this.state = {
            hostname: this.props.db.hostname || "127.0.0.1",
            port: this.props.db.port || "5432",
			username: this.props.db.username || "postgres",
			password: this.props.db.password || "postgres",
			collapseOpen: false,			
        };
		
		
		this.setupDBListener = null;
    }
    
    handleInputChange(event){
        const name = event.target.name;
        const value = event.target.value;
        this.setState({
            [name]: value
        });
    }
	
	componentDidMount(){
		this.props.dispatch(getDBSettings());
		
	}
	
    showCMLeftPanel(){
         this.props.dispatch(setSidePanel('CMSettingsOptions'));
    }
	
	updateDatabaseSetting(event){
		event.preventDefault();
		console.log(this.state)
		this.props.dispatch(updateDBSettings({
			hostname: this.state.hostname,
			port: this.state.port,
			username: this.state.username,
			password: this.state.password
		}));
	}
	
	testDBConnection(){
		this.props.dispatch(checkConnection({
			hostname: this.state.hostname,
			port: this.state.port,
			username: this.state.username,
			password: this.state.password
		}));
	}

	handleOnHrefClick = (event) => {
		event.preventDefault();
		let lnk = event.target.href;
		shell.openExternal(lnk);
	}
	
    handleOpenCollapse = () => this.setState({ collapseOpen: !this.state.collapseOpen });
    handleCloseDialog = () => this.setState({ collapseOpen: false });
    dismissErrorMessage =() => {
		this.props.dispatch(clearDBUpdateError());
	}

    dismissSuccessMessage =() => {
		this.props.dispatch(clearDBUpdateSuccess());
	}
	
	dismissNotice = () => {
		this.setState({notice: null});
	}
				
	setupDB = () => {
		
		this.props.dispatch(startDBSettingsUpdate());
		
		let payload={
			hostname: this.state.hostname,
			port: this.state.port,
			username: this.state.username,
			password: this.state.password
		}
		
		//Send request for background job
		ipcRenderer.send('parse-cm-request', 'setup_database', JSON.stringify(payload));
		
		this.setupDBListener = (event, task, args) => {

			const obj = JSON.parse(args)
			console.log("obj:", obj, "task:", task)
			
			console.log(typeof task);
			console.log(task,"|setup_database");
			console.log(task === "setup_database");
			console.log(task !== "setup_database");
			
			if(task !== "setup_database") return;
			console.log("obj.status:", obj.status)
			
			
			if(obj.status === "error"){
				this.props.dispatch(showDBUpdateError(obj.message));
				ipcRenderer.removeListener("parse-cm-request", this.setupDBListener);
				this.props.dispatch(stopDBSettingsUpdate());
				this.setupDBListener = null;
				
			}

			
			if(obj.status === "success" ){
				this.props.dispatch(showDBUpdateSuccess( obj.message));
				ipcRenderer.removeListener("parse-cm-request", this.setupDBListener);
				this.props.dispatch(stopDBSettingsUpdate());
				this.setupDBListener = null;

			}
		}
		
		//Listen on channel
		ipcRenderer.on('parse-cm-request', this.setupDBListener);
	}
	
    render(){
		
		let errorNotice = null
		if(this.props.db.error !== null){
			errorNotice = (<div className="alert alert-danger mt-2 p-2" role="alert">
						{this.props.db.error}
						<button type="button" className="close"  aria-label="Close" onClick={this.dismissErrorMessage}>
                            <span aria-hidden="true">&times;</span>
                        </button>
					</div>)
		}
		
		let successNotice = null
		if(this.props.db.success !== null){
			successNotice = (<div className="alert alert-success mt-2 p-2" role="alert">
						{this.props.db.success}
						<button type="button" className="close"  aria-label="Close" onClick={this.dismissSuccessMessage}>
                            <span aria-hidden="true">&times;</span>
                        </button>
					</div>)
		}
		
        return (
            <div>
                <h3><FontAwesomeIcon icon="database"/> Database</h3> 
				<Callout intent={Intent.PRIMARY}>
					For an enhanced experience, we require PostgreSQL. Provide the superuser connection details(or default user created during installation) and click the <strong>Setup database</strong> button. 
					This will create the  application database (<strong>boda</strong>), user(<strong>bodastage</strong>) with password (<strong>password</strong>) 
					and also create other database objects such as tables.
				
				</Callout>

				{errorNotice}
				{successNotice}
				
				{ this.props.db.updating ? <ProgressBar className="mt-2" intent={Intent.PRIMARY}/> : "" }
				
                <div className="card  mt-2">
                    <div className="card-body pt-3">
									
						<form onSubmit={this.updateDatabaseSetting}>
						
							<div className="form-group row">
								<label htmlFor="inputHostname" className="col-sm-2 col-form-label">Hostname</label>
								<div className="col-sm-6">
								  <input type="text" className="form-control form-control-sm" id="staticHostname" onChange={this.handleInputChange} value={this.state.hostname} name="hostname" disabled={this.props.db.updating}/>
								</div>
							</div>
						 
							<div className="form-group row">
								<label htmlFor="inputPort" className="col-sm-2 col-form-label">Port</label>
								<div className="col-sm-6">
								  <input type="text" className="form-control form-control-sm" id="staticPort" onChange={this.handleInputChange} value={this.state.port} name="port"  disabled={this.props.db.updating}/>
								</div>
							</div>
							
							<div className="form-group row">
								<label htmlFor="inputUsername" className="col-sm-2 col-form-label">Username</label>
								<div className="col-sm-6">
								  <input type="text" className="form-control form-control-sm" id="staticUsername" onChange={this.handleInputChange} value={this.state.username} name="username"  disabled={this.props.db.updating}/>
								</div>
							</div>
						  
							<div className="form-group row">
								<label htmlFor="inputPassword" className="col-sm-2 col-form-label">Password</label>
								<div className="col-sm-6">
								  <input type="text" className="form-control form-control-sm" id="staticPassword" onChange={this.handleInputChange} value={this.state.password} name="password"  disabled={this.props.db.updating}/>
								</div>
							</div>
						  

						  <Button type="submit" text="Update" intent={Intent.PRIMARY} disabled={this.props.updating} disabled={this.props.db.updating}/> &nbsp;
						  <Button type="button" intent={Intent.SUCCESS} icon="play"  text="Setup database"  disabled={this.props.updating} onClick={this.setupDB} disabled={this.props.db.updating}/> &nbsp;
						  <Button type="button" text="Test connection"  disabled={this.props.updating} onClick={this.testDBConnection} disabled={this.props.db.updating}/> &nbsp;
						  <Button type="button" text="How to install PostgreSQL"  minimal={true} disabled={this.props.updating} icon="info-sign" onClick={(e) => { e.preventDefault(); this.handleOpenCollapse();}}/> &nbsp;
						  
						  <Collapse isOpen={this.state.collapseOpen} className="mt-2">
							<Callout>
								<p>
									<strong>
										We require you to manually install PostgreSQL as it requires elevated privileges to be run as a service.
									</strong>
								</p>
								
								
								<ol>
									<li>  Download version 10.9 installer from the <a href="https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" onClick={this.handleOnHrefClick}>Enterprise DB Download page</a> </li>
									<li> Run installation</li>
									<li> Confirm <strong>psql</strong> command is available in the system PATH i.e. can be run from the terminal. Type <code>psql --help</code>  in the terminal to confirm.</li>
									<li> Restart Boda-Lite application</li>
								</ol>
								
								<p>
								See documentation for more details.
								</p>
							</Callout>
						  </Collapse>
						  
						</form>  
						
						
						
						
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
	
  if(state.settings.db.settings === null ){
	  return {
		  db: {
			hostname: '127.0.0.1',
			port: '5432',
			username: 'postgres',
			password: 'postgres',
			error: null,
			success: null,
			updating: null,
		  }

	  }
  }
  
  return {
	db: {
		hostname: state.settings.db.settings.hostname,
		port: state.settings.db.settings.port,
		username: state.settings.db.settings.username,
		password: state.settings.db.settings.password,
		error: state.settings.db.error,
		success: state.settings.db.success,
		updating: state.settings.db.updating,
	}
  }
}

export default connect(mapStateToProps)(Database);