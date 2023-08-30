import React, { useState, useEffect } from 'react';
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
import ReportContainer from '../reports/ReportContainer';
import CreateReport from '../reports/CreateReport';
import CreateCompositeReport from '../reports/CreateCompositeReport';
import GISMap from '../gis/GISMap';
import Baseline from '../baseline/Baseline';
import ParameterLibrary from '../telecomlib/ParameterLibrary';
import CSVToExcelCombiner from '../utilities/CSVToExcelCombiner';
import KMLGenerator from '../utilities/KMLGenerator';
import PyEditor from '../pystudio/PyEditor';
import { useDispatch, useSelector } from 'react-redux';

const Components = {
    "Help": Help,
    "Dashboard": Dashboard,
	"ParseAndImport": ParseAndImport,
	"UserProfile": UserProfile,
	"Settings": Settings,
	"ReportContainer": ReportContainer,
	"CreateReport": CreateReport,
	"CreateCompositeReport": CreateCompositeReport,
	"GISMap": GISMap,
	"Baseline": Baseline,
	"ParameterLibrary": ParameterLibrary,
	"CSVToExcelCombiner": CSVToExcelCombiner,
	"KMLGenerator": KMLGenerator,
	"PyEditor": PyEditor
};

const Tabs = (props) =>  {
    const dispatch = useDispatch();
    const { activeTab, tabs } = useSelector(state => state.uiLayout);
    const [ collapseFrom, setCollapseFrom ] = useState(Boundary.END);
    const [ width, setWidth ] = useState(50);
    //const [items, setItems] = useState([]);

    const setTheActiveTab = (tabId) => (e) => { 
        e.stopPropagation();
        e.preventDefault();
        
        dispatch(setActiveTab(tabId));
        
    }
    
    const closeTheTab = (tabId) => (e) => { 
        e.stopPropagation();
        e.preventDefault();
        
        dispatch(closeTab(tabId));
    }
    
    const renderOverflow = (its) => {
        const position = collapseFrom === Boundary.END ? Position.BOTTOM_RIGHT : Position.BOTTOM_LEFT;
        let orderedItems = its;
        if (collapseFrom === Boundary.START) {
            orderedItems = its.slice().reverse();
        }
        const menuItems = orderedItems.map(
                (item, index) => <MenuItem {...item} key={index} 
                                    onClick={setTheActiveTab(item.tabid)} 
                                    labelElement={<Icon icon="cross" onClick={closeTheTab(item.tabid)}/>} />);
        return (
            <li>
                <Popover position={position}>
                    <span className={Classes.BREADCRUMBS_COLLAPSED} />
                    <Menu>{menuItems}</Menu>
                </Popover>
            </li>
        );
    };
    
    const renderBreadcrumb = (props, index) => {
        const tabId = props.tabid;
        const Tag = Components[tabs[tabId].component];
        const options = tabs[tabId].options;
        const activeClass = activeTab === tabId ? 'active show' : ""; 
        
        return (
            <li className="nav-item" key={tabId}>
                <a 
                    className={"nav-link " + activeClass} 
                    id={tabId+"-tab"} 
                    data-toggle="tab" 
                    href={"#"+tabId} 
                    role="tab" aria-controls={tabId} aria-selected="false" onClick={setTheActiveTab(tabId)} style={{whiteSpace: "nowrap"}}>
                    
                <FontAwesomeIcon icon={Tag.icon}/> <span className="tab-label">{options.title}&nbsp;</span>
                { tabs[tabId].component === 'Dashboard' ? "" :   <button type="button" className="btn-close right" data-bs-dismiss="alert" aria-label="Close" onClick={closeTheTab(tabId)} ></button>
               
            }    
                </a>
            </li>
        );
    }
    
    //tabContents
    let tabContents = [];
    for( let tabId in tabs){
        const Tag = Components[tabs[tabId].component];
        const options = tabs[tabId].options;
        const activeClass = activeTab === tabId ? "active show" : ""; 

        tabContents.push(
            <div key={tabId} 
                className={"tab-pane fade " + activeClass} 
                id={tabId} 
                role="tabpanel" 
                aria-labelledby={ tabId + "-tab"}>
                    <Tag options={options}/>
            </div>
        );
    }

    //tabs
    let items = [];
    for (var tabId in tabs){
        const Tag = Components[tabs[tabId].component];
        const options = tabs[tabId].options;
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
                        overflowRenderer={renderOverflow}
                        visibleItemRenderer={renderBreadcrumb}
                        observeParents={true}
                        key={items.length}
                        />
                </ul>
                
                <div className="tab-content" id="bts_tabs_content">
                    {tabContents}
                </div>      
            </div>
        );

}

export default Tabs;