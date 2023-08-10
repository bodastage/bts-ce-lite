import React from 'react';
import { connect } from 'react-redux';
import Tabs from './Tabs';
import SidePanel from './SidePanel';
import  './UILayout.css';
import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import logo from '../../images/boda-lite-logo-trimmed.png';
import { Button, Alignment, Menu, MenuDivider, MenuItem, Popover, Position, Navbar } from "@blueprintjs/core";
import { addTab, setSidePanel } from '../layout/uilayout-actions';
import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';
import './layout.less';
import VERSION from '../../version';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setUpdating } from '../session/session-actions';

class UILayout extends React.Component {
	constructor(props){
            super(props);
            
            this.logout = this.logout.bind(this);
			this.setSidePanel = this.setSidePanel.bind(this);

	}
	
	addTab = (options) => (e) => { 
		e.preventDefault();
		let tabId = options.component;
		this.props.dispatch(addTab(tabId, options.component, {title: options.title}));
	}

	logout(event){
		event.preventDefault();
		this.props.dispatch({
			type: "LOGOUT"
		});	
	}

	updateApp(event) {
		event.preventDefault();
		this.props.dispatch(setUpdating(true));
	}
    
	/*
	*
	*/
	resetUI = () => {
		window.localStorage.clear();
		window.location.reload();
	}
	setSidePanel = (sidePanel) => (e) => { 
		e.preventDefault();
		
		this.props.dispatch(setSidePanel(sidePanel));
	}
        renderNavBar() {
            
            const moduleMenu = (
            <Menu>
                <MenuItem icon="asterisk" text="Parse and Import" 
                    onClick={this.addTab({
                                component: 'ParseAndImport',
                                title: 'Parse and Import'
                                })}
                />
				
                <MenuItem icon="th" text="Reports" onClick={this.setSidePanel('ReportsTree')}/>
				<MenuItem 
					icon="globe" 
					text="GIS" 
					onClick={this.addTab({component: 'GISMap',title: 'GIS'})}/>
				
				<MenuItem 
					icon={<span><FontAwesomeIcon icon="pencil-ruler"/></span>} 
					text="Baseline Audit" 
					onClick={this.addTab({component: 'Baseline',title: 'Baseline Audit'})}/>
					
				<MenuItem 
					icon={<span><FontAwesomeIcon icon="book"/></span>} 
					text="Parameter Reference" 
					onClick={this.addTab({component: 'ParameterLibrary',title: 'Parameter Reference'})}/>
					
				<MenuDivider />

				<MenuItem 
					icon={<span><FontAwesomeIcon icon="file-excel"/></span>} 
					text="CSV to Excel" 
					onClick={this.addTab({component: 'CSVToExcelCombiner',title: 'CSV to Excel'})}/>
					
				<MenuItem 
					icon={<span><FontAwesomeIcon icon="globe"/></span>} 
					text="KML Generator" 
					onClick={this.addTab({component: 'KMLGenerator',title: 'KML Generator'})}/>
					
					
				<MenuDivider />
				
				
                <MenuItem icon="cog" text="Settings" onClick={this.addTab({
                                component: 'Settings', title: 'Settings'})}/>
            </Menu>
            );
    
            const sessionMenu = (
            <Menu>
                <MenuItem icon="user" text="Profile" onClick={this.addTab({
                        component: 'UserProfile', 
                        title:'Profile'})}/>
				<MenuItem icon="eraser" text="Reset UI" onClick={this.resetUI.bind(this)} />		
				<MenuItem icon="wrench" text="Update" onClick={this.updateApp.bind(this)} />		
                <MenuItem icon="power" text="Logout" className={classNames(Classes.MINIMAL, Classes.INTENT_DANGER)} onClick={this.logout} />
            </Menu>
            );

            return ( 
				<Navbar className={classNames(Classes.DARK)}>
				
					<Navbar.Group align={Alignment.LEFT}>
						<img src={logo} width="50px" alt="BTS-CE-Lite" />  &nbsp;&nbsp;&nbsp;
						<Navbar.Heading>Boda-Lite <span className="version bp3-text-muted">v{VERSION}</span></Navbar.Heading>
					</Navbar.Group>
					<Navbar.Group align={Alignment.RIGHT}>
						<Button className={Classes.MINIMAL} icon="home" text="Home" 
                            onClick={this.addTab({component: 'dashboard', title: 'Home'})}/>
                        <Popover content={moduleMenu} position={Position.BOTTOM}>
                            <Button className={Classes.MINIMAL} icon="cube" text="Modules" />
                        </Popover>
                        <Button className={Classes.MINIMAL} icon="help" text="Help" 
                            onClick={this.addTab({component: 'Help', title: 'Help'})}
                        />
                        <Popover content={sessionMenu} position={Position.BOTTOM}>
                            <Button className={Classes.MINIMAL} icon="user" text={this.props.userDetails.first_name} />
                        </Popover>
					</Navbar.Group>
				</Navbar>
            );
        }
        
	render(){
            return (
                <div className="react-mosaic-example-app bp5-ui-text">
                {this.renderNavBar()}
                    <SplitterLayout vertical={false} secondaryInitialSize={322} primaryIndex={1} >
                        <SidePanel/>
                        <Tabs activeTab={this.props.activeTab} tabs={this.props.tabs || []}/>
                    </SplitterLayout>
                </div>
            );
	}
}

function mapStateToProps(state) {
  return {
    tabs: state.uiLayout.tabs,
    activeTab: state.uiLayout.activeTab,
    userDetails: state.session.userDetails
  }
}

export default connect(mapStateToProps)(UILayout);