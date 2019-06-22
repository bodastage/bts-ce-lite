import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getReports, setReportFilter, getReportInfo,
         clearReportTreeError } from './reports-actions';
import { addTab, closeTab } from '../layout/uilayout-actions';
import { Classes, Icon, ITreeNode, Tooltip, Tree, FormGroup, InputGroup, 
         ContextMenu, ContextMenuTarget, Menu, MenuDivider, MenuItem,
        ProgressBar, Dialog, TextArea, Intent, Spinner, Button} from "@blueprintjs/core";
import './reports-panel.css';

class ReportsTree extends React.Component{
    static icon = "table";
    static label = "Reports";
    
    constructor(props){
        super(props)
        
        this.handleChangeEvent = this.handleChangeEvent.bind(this);
        this.dismissError = this.dismissError.bind(this);
        this.showReportDataTab = this.showReportDataTab.bind(this);
        this.updateNodes = this.updateNodes.bind(this);
        this.onNodeDoubleClick = this.onNodeDoubleClick.bind(this);
        this.handleNodeCollapse = this.handleNodeCollapse.bind(this);
        this.showContextMenu = this.showContextMenu.bind(this);


        this.state = {
            text: this.props.filter.text,
            categories: this.props.filter.categories,
            reports: this.props.filter.reports,
            nodesChanges: 0,
            expandedNodes:[],

            isContextMenuOpen: false,
          
          /*Category edit/rename dialog*/
            autoFocus: true,
            canEscapeKeyClose: true,
            canOutsideClickClose: true,
            enforceFocus: true,
            isOpen: false,
            usePortal: true,
            
            catName: ''
        };
        
        this.filterReports = this.state.reports;
        this.filterText = this.state.text;
        this.filterCategories = this.state.categories;
        
        this.nodes = [];

        
        //This is incremenet to force input and textare for category renaming to
        //re-render
        this.nameRedraw = 0;
        

    }

    /**
     * Show reports context menu
     * 
     * @param node
     * @param nodePath
     * @param e
     */
    showContextMenu(node, nodePath, e){
        e.preventDefault();

        // Add context menu based on entity type
        if(typeof node.reportId !== 'undefined'){
            ContextMenu.show(
                <Menu>
                    <MenuItem icon="th" text="View report" onClick={(ev) => {ev.preventDefault(); this.showReportDataTab(node.label, node.reportId);}}/>
                </Menu>,
                { left: e.clientX, top: e.clientY },
                () => this.setState({ isContextMenuOpen: false }),
            );
        }
        
        this.setState({ isContextMenuOpen: true });

    }

    /**
     * Handle change event on search input field
     * 
     * @param {type} event
     */
    handleChangeEvent(event){
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        this.setState({
          [name]: value
        });
        
        switch(name){
            case 'text':this.filterText = value;break;
            case 'reports':this.filterReports = value;break;
            case 'categories':this.filterCategories = value;break;
        }
        
        this.updateFilter();
    }
    
    /**
     * Check whether list of reports provided contains atleast one matching the 
     * search string 
     * 
     * @param Array rules Array of rules
     * @param String search Search String
     * @returns {Boolean}
     */
    catContainsMatchingReport(reports, search){
        var regex = new RegExp(search, 'i');
        for(var key in reports){
            if ( regex.test(reports[key].name) ) return true;
        }
        return false;
    }
    
    /**
     * Update report search 
     * 
     * @returns {undefined}
     */
    updateFilter(){
        this.props.dispatch(setReportFilter(this.state.text, this.filterCategories, this.filterReports));
    }
    
    componentDidMount(){
        this.props.dispatch(getReports());
        
        this.updateNodes();
    }
    
    dismissError(){
        this.props.dispatch(clearReportTreeError());
    }
    
   
    showReportDataTab(reportName, reportId){ 
        let tabId = 'report_' + reportId + "_tab";
        
        this.props.dispatch(addTab(tabId, 'ReportContainer', {
            title: reportName,
            reportId: reportId
        }));
    }
    
    /**
     * Update tree nodes
     * 
     * @returns
     */
    updateNodes(){
        this.nodes = [];
        
        const filterText = this.state.text;
        const filterOnReports = this.state.reports;
        const filterOnCategories = this.state.categories;
        const noFilter = filterOnReports && filterOnCategories && (filterText === '');
        
        for(let key in this.props.reports){
            let cat = this.props.reports[key];
            
            //Filter categories
            var regex = new RegExp(filterText, 'i');
            if( (filterText !== "" && filterOnCategories && !regex.test(cat.cat_name)) ||
                (!this.catContainsMatchingReport(cat.reports, filterText) && filterOnReports )
              ){ 
                continue;
            }
        
            const isExpanded = this.state.expandedNodes.indexOf(cat.cat_id) !== -1
            const icon = isExpanded === true ? "folder-open": "folder-close"
            let reportCategory = {
                id: cat.cat_id,
                hasCaret: true,
                icon: icon,
                label: cat.cat_name,
                key: cat.cat_id,
                isExpanded : isExpanded,
                catId: cat.cat_id,
                childNodes: []        
            };
            
            //Get reports under category 
            for (let k in cat.reports){
                let report = cat.reports[k];
                
                //Filter rules
                if( (filterText !== "" && filterOnReports && !regex.test(report.name)) ){
                    continue;
                }
                
                reportCategory['childNodes'].push({
                    id: cat.cat_id + "-" + report.id,
                    label: report.name,
                    icon: "document",
                    reportId: report.id,
                    catId: cat.cat_id
                });
            }
            this.nodes.push(reportCategory);

        }
    }

    /**
     * Show report table when report name is double clicked
     * 
     * @param {type} nodeData
     * @returns {undefined}
     */
    onNodeDoubleClick = (nodeData) => {

        if(typeof nodeData.reportId !== 'undefined'){
            this.showReportDataTab(nodeData.label, nodeData.reportId);
        }
    }
    
    handleNodeCollapse = (nodeData) => {
        const expandedNodes = this.state.expandedNodes.filter((v,k) => v !== nodeData.catId)
        this.setState({expandedNodes: expandedNodes});
    };

    handleNodeExpand = (nodeData) => {
        
        let expandedNodes = this.state.expandedNodes;
        if(this.state.expandedNodes.indexOf(nodeData.catId) === -1 ){
            expandedNodes.push(nodeData.catId)
        }else{
            return true;
        }
        
        this.setState({expandedNodes: expandedNodes});
    };

    
    render(){        
        
        this.updateNodes();
                                
        return (
            
        <div>
		<span className="dropdown-item-text legend w-100 mb-2">
			<FontAwesomeIcon icon={ReportsTree.icon}/> Reports
			
			<Icon icon="refresh" className="float-right ml-2"/>&nbsp;
			<Icon icon="folder-new" className="float-right ml-2"/> &nbsp; 
			<Icon icon="plus" className="float-right ml-2"/> &nbsp;
		</span>

                <div>
                <FormGroup
                    label=""
                    labelFor="search_reports"
                >
                    <InputGroup 
                        id="search_network" 
                        placeholder="Search reports..." 
                        leftIcon="search" 
                        name="text"
                        type="text"
                        value={this.state.text} 
                        onChange={this.handleChangeEvent}
                    />
                </FormGroup>
                
                <div className="mb-2">
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="inlineCheckbox1" checked={this.state.categories} name="categories" onChange={this.handleChangeEvent}/>
                        <label className="form-check-label" htmlFor="inlineCheckbox1">Categories</label>
                    </div>

                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="inlineCheckbox2" checked={this.state.reports} name="reports" onChange={this.handleChangeEvent}/>
                        <label className="form-check-label" htmlFor="inlineCheckbox2">Reports</label>
                    </div>
                </div>
        
                {this.props.requestError === null ? '': 
                    <div className="alert alert-danger mt-1 mb-1 p-2" role="alert">
                        {this.props.requestError}
                        <button type="button" className="close"  aria-label="Close" onClick={this.dismissError}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>     
                }
                
                {this.props.requestingReports === true ? <ProgressBar /> : ""}
                
            <Tree 
                contents={this.nodes}
                onNodeDoubleClick={this.onNodeDoubleClick}
                onNodeCollapse={this.handleNodeCollapse}
                onNodeExpand={this.handleNodeExpand}
                onNodeContextMenu={this.showContextMenu}
            />
            </div>
            
 
        </div>
        );
    }
    
}
    
function mapStateToProps(state){

    return {
        reports: state.reports.reports, //categories
        filter: state.reports.filter,
        requestingReports: state.reports.requestingReports,
        requestError: state.reports.requestError,
    };
    
    
}

export default connect(mapStateToProps)(ReportsTree);