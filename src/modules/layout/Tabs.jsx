import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Dashboard from '../dashboard/Dashboard';
import ParseAndImport from '../cm/ParseAndImport';
import { closeTab, setActiveTab } from './uilayout-actions';
import { OverflowList, Boundary, Position, Classes, MenuItem, 
    Popover, Menu, Icon } from "@blueprintjs/core";
import Help from '../help/Help';
import UserProfile from '../profile/UserProfile';
import Settings from '../settings/Settings';
import Database from '../settings/Database';
import ReportContainer from '../reports/ReportContainer';
import CreateReport from '../reports/CreateReport';
import CreateCompositeReport from '../reports/CreateCompositeReport';
import GISMap from '../gis/GISMap';
import Baseline from '../baseline/Baseline';
import ParameterLibrary from '../telecomlib/ParameterLibrary';

const Components = {
    "Help": Help,
    "Dashboard": Dashboard,
	"ParseAndImport": ParseAndImport,
	"UserProfile": UserProfile,
	"Settings": Settings,
	"Database": Database,
	"ReportContainer": ReportContainer,
	"CreateReport": CreateReport,
	"CreateCompositeReport": CreateCompositeReport,
	"GISMap": GISMap,
	"Baseline": Baseline,
	"ParameterLibrary": ParameterLibrary
    };

class Tabs extends React.Component {
    constructor(props){
        super(props);
        
        this.closeTab = this.closeTab.bind(this);
        this.renderOverflow = this.renderOverflow.bind(this);
        this.renderBreadcrumb = this.renderBreadcrumb.bind(this);
        this.renderOverflow = this.renderOverflow.bind(this);
        
        this.state = {
            collapseFrom: Boundary.END,
            width: 50,
        }
    }

    setActiveTab = (tabId) => (e) => { 
        e.stopPropagation();
        e.preventDefault();
        
        this.props.dispatch(setActiveTab(tabId));
        
    }
    
    closeTab = (tabId) => (e) => { 
        e.stopPropagation();
        e.preventDefault();
        
        this.props.dispatch(closeTab(tabId));
    }
    
    renderOverflow = (items) => {
        const { collapseFrom } = this.state;
        const position = collapseFrom === Boundary.END ? Position.BOTTOM_RIGHT : Position.BOTTOM_LEFT;
        let orderedItems = items;
        if (this.state.collapseFrom === Boundary.START) {
            orderedItems = items.slice().reverse();
        }
        const menuItems = orderedItems.map(
                (item, index) => <MenuItem {...item} key={index} 
                                    onClick={this.setActiveTab(item.tabid)} 
                                    labelElement={<Icon icon="cross" onClick={this.closeTab(item.tabid)}/>} />);
        return (
            <li>
                <Popover position={position}>
                    <span className={Classes.BREADCRUMBS_COLLAPSED} />
                    <Menu>{menuItems}</Menu>
                </Popover>
            </li>
        );
    };
    
    renderBreadcrumb(props, index) {
        const tabId = props.tabid;
        const Tag = Components[ this.props.tabs[tabId].component];
        const options = this.props.tabs[tabId].options;
        
        const activeClass = this.props.activeTab === tabId ? 'active show' : ""; 
        
        return (
            <li className="nav-item" key={tabId}>
                <a className={"nav-link " + activeClass} id={tabId+"-tab"} data-toggle="tab" href={"#"+tabId} role="tab" aria-controls={tabId} aria-selected="false" onClick={this.setActiveTab(tabId)} style={{whiteSpace: "nowrap"}}>
                { this.props.tabs[tabId].component === 'Dashboard' ? "" :
                <button type="button" className="close" aria-label="Close" onClick={this.closeTab(tabId)} style={{marginLeft: "5px"}}>
                    <span aria-hidden="true">&times;</span>
                </button>
                }            
                <FontAwesomeIcon icon={Tag.icon}/> <span className="tab-label">{options.title}&nbsp;</span>

                </a>
            </li>
        );
    }
    
    render(){
        let tabContents = [];
        for( let tabId in this.props.tabs){
            const Tag = Components[ this.props.tabs[tabId].component];
            const options = this.props.tabs[tabId].options;
            const activeClass = this.props.activeTab === tabId ? "active show" : ""; 

            tabContents.push(
                    <div key={tabId} className={"tab-pane fade " + activeClass} id={tabId} role="tabpanel" aria-labelledby={ tabId + "-tab"}><Tag options={options}/></div>
            );
        }
        
        const { collapseFrom } = this.state;
        let items = [];
        for (var tabId in this.props.tabs){
            const Tag = Components[ this.props.tabs[tabId].component];
            const options = this.props.tabs[tabId].options;
            items.push(
                {   href: "#", 
                    icon: <FontAwesomeIcon icon={Tag.icon}/>, 
                    text: options.title, tabid: tabId
                }
            );
        }
        return (
            <div>
                <ul className="nav nav-tabs" id="bts_tabs" role="tablist">
                    <OverflowList
                        collapseFrom={collapseFrom}
                        items={items}
                        overflowRenderer={this.renderOverflow}
                        visibleItemRenderer={this.renderBreadcrumb}
                        observeParents={true}
                        />
                </ul>
                
                <div className="tab-content" id="bts_tabs_content">
                    {tabContents}
                </div>      
            </div>
        );
    }
}

export default connect()(Tabs);