import React from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import Dashboard from '../dashboard/Dashboard';
import Tabs from './Tabs';
import * as UILayoutActions from './uilayout-actions';
import SidePanel from './SidePanel';
import  './UILayout.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import logo from '../../images/logo-no-text-white.svg';
import { Button, Alignment, Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core";
import { addTab } from '../layout/uilayout-actions';
import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';
import './layout.less';

class UILayout extends React.Component {
	constructor(props){
            super(props);
            
            this.logout = this.logout.bind(this);

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
    
        renderNavBar() {
            
            const moduleMenu = (
            <Menu>
                <MenuItem icon="wrench" text="Network Audit" 
                    onClick={this.addTab({
                    component: 'NetworkAudit',
                    title: 'Network Audit'
                })}/>
                <MenuItem icon="th" text="Reports" 
                    onClick={this.addTab({
                        component: 'Reports',
                        title: 'Reports'
                    })}
                />
                <MenuItem icon="graph" text="Network Browser" 
                    onClick={this.addTab({
                    component: 'NetworkBrowser',
                    title: 'Network Browser'
                })}/>
                <MenuItem icon={<FontAwesomeIcon icon="puzzle-piece"/>} text="MO Browser" 
                    onClick={this.addTab({
                            component: 'MOBrowser',
                            title: 'MO Browser'})}
                />
                <MenuItem icon={<FontAwesomeIcon icon="university"/>} text="Telecom Library" 
                    onClick={this.addTab({
                        component: 'TelecomLib',
                        title: 'Telecom Library'
                    })}
                />

                <MenuDivider />
                <MenuItem icon="cube" text="Performance" disabled={true} />
                <MenuItem icon="cube" text="SON" disabled={true} />
                <MenuItem icon="cube" text="CEx" disabled={true} />
                <MenuItem icon="cube" text="Faults" disabled={true} />
                <MenuItem icon="cube" text="Geo-Location" disabled={true} />
                <MenuItem icon="cube" text="Work Orders" disabled={true} />
                <MenuDivider />
                <MenuItem icon={<FontAwesomeIcon icon="cogs"/>} text="Processes"
                    onClick={this.addTab({
                        component: 'Processes', 
                        title: 'Processes'
                    })}
                />
                <MenuItem icon="cog" text="Settings...">
                    <MenuItem icon="cog" text="Configuration" disabled={true} />
                </MenuItem>
            </Menu>
            );
    
            const sessionMenu = (
            <Menu>
                <MenuItem icon="user" text="Profile" 
                    onClick={this.addTab({
                        component: 'UserProfile', 
                        title:'Profile'})}/>
                <MenuItem icon="power" text="Logout" className={classNames(Classes.MINIMAL, Classes.INTENT_DANGER)} onClick={this.logout} />
            </Menu>
            );

            return (
                <div className={classNames(Classes.NAVBAR, Classes.DARK)}>
                    <div className={Classes.NAVBAR_GROUP}>

                        <img src={logo} width="50px" alt="Boda-CE-Lite" />  
                        &nbsp;&nbsp;&nbsp;
                            <div className={Classes.NAVBAR_HEADING}> 
                                <div> 
                                  Boda-CE-Lite <span className="version bp3-text-muted">v{"0.0.1"}</span>
                                </div>
                            </div>
                    </div>
                    
                    <div className={classNames(Classes.NAVBAR_GROUP, Classes.BUTTON_GROUP)} align={Alignment.RIGHT}>
                        <Button className={Classes.MINIMAL} icon="home" text="Home" 
                            onClick={this.addTab({component: 'dashboard', title: 'Home'})}/>
                        <Popover content={moduleMenu} position={Position.BOTTOM}>
                            <Button className={Classes.MINIMAL} icon="cube" text="Modules" />
                        </Popover>
                        <Button className={Classes.MINIMAL} icon="help" text="Help" 
                            onClick={this.addTab({component: 'Help', title: 'Help'})}
                        />
                        <Popover content={sessionMenu} position={Position.BOTTOM}>
                            <Button className={Classes.MINIMAL} icon="user" text={"Username"} />
                        </Popover>
                    </div>
                </div>   
            );
        }
        
	render(){
            return (
                <div className="react-mosaic-example-app">
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