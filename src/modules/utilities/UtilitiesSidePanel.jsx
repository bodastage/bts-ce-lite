import React from 'react';
import ReportsTree from '../reports/ReportsTree';
import GISLeftPanel from '../gis/GISLeftPanel';
import { connect } from 'react-redux';
import { addTab, setSidePanel } from '../layout/uilayout-actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class UtilitiesSidePanel extends React.Component {
    constructor(props){
        super(props);
        
        this.addTab = this.addTab.bind(this);

    }
    
	
    addTab = (options) => (e) => { 
        e.preventDefault();

        let tabId = options.component;
        this.props.dispatch(addTab(tabId, options.component, {title: options.title}));
    }
    

    render(){
        return (
        <div>
            <span className="dropdown-item-text legend w-100">Utilities</span>
            <a title="CSV to Excel Converter" 
				className="dropdown-item mt-2" 
				href="/#" 
				onClick={this.addTab({
					component: 'CSVToExcelCombiner',
					title: 'CSV to Excel'
				})}> <FontAwesomeIcon icon="candy-cane" /> CSV to Excel</a>  

            <a title="KML Generator" 
				className="dropdown-item mt-2" 
				href="/#" 
				onClick={this.addTab({
					component: 'KMLGenerator',
					title: 'KML Generator'
				})}> <FontAwesomeIcon icon="globe" /> KML Generator</a>  






        </div>
        );
        
    }
}


export default connect()(UtilitiesSidePanel);