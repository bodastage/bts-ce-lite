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
import { Button, Alignment, Menu, MenuDivider, MenuItem, Popover, Position, Navbar } from "@blueprintjs/core";
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
                <MenuItem icon="asterisk" text="Process CM dumps" 
                    onClick={this.addTab({
                                component: 'ProcessCMDumps',
                                title: 'Process CM dumps'
                                })}
                />
				
                <MenuItem icon="th" text="Reports" />
				
            </Menu>
            );
    
            const sessionMenu = (
            <Menu>
                <MenuItem icon="user" text="Profile" />
                <MenuItem icon="power" text="Logout" className={classNames(Classes.MINIMAL, Classes.INTENT_DANGER)} onClick={this.logout} />
            </Menu>
            );

            return (
				<Navbar className={classNames(Classes.DARK)}>
				
					<Navbar.Group align={Alignment.LEFT}>
						<img src={logo} width="50px" alt="BTS-CE-Lite" />  &nbsp;&nbsp;&nbsp;
						<Navbar.Heading>BTS-CE-Lite <span className="version bp3-text-muted">v{"0.0.6"}</span></Navbar.Heading>
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
                            <Button className={Classes.MINIMAL} icon="user" text={"Username"} />
                        </Popover>
					</Navbar.Group>
				</Navbar>
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