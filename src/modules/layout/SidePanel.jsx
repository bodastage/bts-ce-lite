import React from 'react';
import DashboardSidePanel from '../dashboard/DashboardSidepanel';
import ReportsTree from '../reports/ReportsTree';
import GISLeftPanel from '../gis/GISLeftPanel';
import { connect } from 'react-redux';
import './sidepanel.css'
import UtilitiesSidePanel from '../utilities/UtilitiesSidePanel';

const SidePanels = {
  "DashboardSidePanel": DashboardSidePanel,
	"ReportsTree": ReportsTree,
	"GISLeftPanel": GISLeftPanel,
	"UtilitiesSidePanel": UtilitiesSidePanel
};

class SidePanel extends React.Component{

    render(){
        const CurrentPanel = SidePanels[this.props.activePanel] || DashboardSidePanel;
        return (
                <CurrentPanel/>
        );
        
    }
    
}

function mapStateToProps(state) {
  return {
    activePanel: state.uiLayout.activePanel
  }
}

export default connect(mapStateToProps)(SidePanel);