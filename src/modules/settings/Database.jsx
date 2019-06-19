import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setSidePanel } from '../layout/uilayout-actions';
import { Button, Intent, ProgressBar, Dialog, Classes, Icon, Callout } from "@blueprintjs/core";

class Database extends React.Component{
    static icon = "database";
    static label = "Database";
    constructor(props){
        super(props);
        
        this.showCMLeftPanel = this.showCMLeftPanel.bind(this);
		
        this.state = {
            hostname: this.props.hostname || "127.0.0.1",
            port: this.props.port || "12701",
			dialogOpen: false
        };
    }
    
    showCMLeftPanel(){
         this.props.dispatch(setSidePanel('CMSettingsOptions'));
    }
	
	updateDatabaseSetting(){
		
	}
	
	testDBConnection(){
		
	}

	
    handleOpenDialog = () => this.setState({ dialogOpen: true });
    handleCloseDialog = () => this.setState({ dialogOpen: false });
    
    render(){
        return (
            <div>
                <h3><FontAwesomeIcon icon="database"/> Database</h3> 
				<Callout intent={Intent.PRIMARY}>For enhanced experience, we require MongoDB</Callout>
                <div className="card  mt-2">
                    <div className="card-body p-3">
									
						<form onSubmit={this.updateDatabaseSetting}>
						
							<div className="form-group row">
								<label htmlFor="inputHostname" className="col-sm-2 col-form-label">Hostname</label>
								<div className="col-sm-6">
								  <input type="text" className="form-control form-control-sm" id="staticHostname" onChange={this.handleInputChange} value={this.state.hostname} name="hostname"/>
								</div>
							</div>
						 
							<div className="form-group row">
								<label htmlFor="inputPort" className="col-sm-2 col-form-label">Port</label>
								<div className="col-sm-6">
								  <input type="text" className="form-control form-control-sm" id="staticPort" onChange={this.handleInputChange} value={this.state.port} name="port"/>
								</div>
							</div>
							
							<div className="form-group row">
								<label htmlFor="inputUsername" className="col-sm-2 col-form-label">Username</label>
								<div className="col-sm-6">
								  <input type="text" className="form-control form-control-sm" id="staticUsername" onChange={this.handleInputChange} value={this.state.username} name="username"/>
								</div>
							</div>
						  
							<div className="form-group row">
								<label htmlFor="inputPassword" className="col-sm-2 col-form-label">Password</label>
								<div className="col-sm-6">
								  <input type="text" className="form-control form-control-sm" id="staticPassword" onChange={this.handleInputChange} value={this.state.password} name="password"/>
								</div>
							</div>
						  
						  <Button type="submit" text="Update" intent={Intent.PRIMARY} disabled={this.props.updating}/> &nbsp;
						  <Button type="submit" text="Test connection" intent={Intent.SUCCESS} disabled={this.props.updating}/> &nbsp;
						  <Button type="submit" text="Install MongoDB" disabled={this.props.updating} icon="download" onClick={this.handleOpenDialog}/> &nbsp;
						</form>  
						
						<Dialog 
							icon="database"
							isOpen={this.state.dialogOpen}
							title="Install MongoDB"
							onClose={this.handleCloseDialog}
						>
							<div className={Classes.DIALOG_BODY}>
							
							<p>
								<strong>
									We require you to manually install MongoDB as it requires elevated privileges to be run as a service.
								</strong>
							</p>
							
							<p>
								<ol>
									<li> Start cmd as an Administrator </li>
									<li> Run: <code>Powershell -ExecutionPolicy ByPass -File install_mongodb_as_service.ps1</code> </li>
								</ol>
								
							</p>
							
							<p className={Classes.INFO}>
							<Icon icon="info-sign" intent={Intent.PRIMARY}/> See documentation for details
							</p>
							
							</div>
						</Dialog>
						
						
                    </div>
                </div>
            </div>
        );
    }
}

export default connect()(Database);