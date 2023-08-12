import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getReports, setReportFilter, deleteReport, getReportInfo,
         clearReportTreeError } from './reports-actions';
import { addTab, closeTab } from '../layout/uilayout-actions';
import { 
    Classes, 
    Icon, 
    Tree, 
    FormGroup, 
    InputGroup, 
    ButtonGroup,
    ContextMenu, 
    Menu, 
    MenuItem,
    ProgressBar, 
    Dialog, 
    TextArea, 
    Intent, 
    Spinner, 
    Button,
    Divider
} from "@blueprintjs/core";
import './reports-panel.css';
import { saveCategory, clearReportCreateState, removeCategory, getCategory,
		clearEditCategoryState, clearCreateCompReportState, 
		clearNewCategoryState } 
	from "./reports-actions"
import { useSelector, useDispatch } from 'react-redux';
import { set } from 'date-fns-jalali';

const ReportsTree = (props) => {
    const dispatch = useDispatch();
    const {
        filter,
        requestingReports,
        requestError,
		requesting, //report categories
		editCat,
    } = useSelector((state) => state.reports);

    const stateReports = useSelector((state) => state.reports.reports);

    const icon = "table";
    const label = "Reports";
    
    const [ text, setText ] = useState(filter.text);
    const [ categories, setCategories ] = useState(filter.categories);
    const [ reports, setReports ] = useState(filter.reports);
    const [ nodesChanges, setNodesChanges ] = useState(0);
    const [ expandedNodes, setExpandedNodes ] = useState([]);
    const [ isContextMenuOpen, setIsContextMenuOpen ] = useState(false);

    const [ autoFocus, setAutoFocus ] = useState(true);
    const [ canEscapeKeyClose, setCanEscapeKeyClose ] = useState(true);
    const [ canOutsideClickClose, setCanOutsideClickClose ] = useState(true);
    const [ enforceFocus, setEnforceFocus ] = useState(true);
    const [ isOpen, setIsOpen ] = useState(false);
    const [ usePortal, setUsePortal ] = useState(true);

    const [ catName, setCatName ] = useState('Category name');
    const [ catNotes, setCatNotes ] = useState('Category notes');
    const [ notesValue, setNotesValue ] = useState("Category notes");
    const [ catDialogTitle, setCatDialogTitle ] = useState("Add report catgory");
        
    if( editCat !== null ){
        setNotesValue(typeof editCat.id !== 'undefined' ? editCat.notes : "");
    }
    
    const [filterReports, setFilterReports] = useState(reports);
    const [filterText, setFilterText] = useState(text);
    const [filterCategories, setFilterCategories] = useState(categories);

    const [isSaving, setIsSaving] = useState(false);

    let nodes = [];
    

        
        //This is incremented to force input and textare for category renaming to
        //re-render
        let nameRedraw = 0;

    const handleNotesChange = (event) => { 
		setCatName(event.target.value); 
        setNotesValue(event.target.value)
	}

    const handleCatNameChange = (event) => setCatName(event.target.value)
    

    const TreeContextMenu = (props) => {
        const { label, catId, reportId, inBuilt, type, children} = props;

        if(typeof reportId !== 'undefined'){
            return  <ContextMenu
                    content={
                        <Menu>
                            <MenuItem icon="th" text="View report" onClick={(ev) => {ev.preventDefault(); showReportDataTab(label, reportId);}}/>
                            { inBuilt === true ? "" : <MenuItem icon="graph-remove" text="Delete report" onClick={(ev) => {ev.preventDefault(); removeReport(reportId);}}/> }	
                            { inBuilt === false && type === 'composite' ? <MenuItem icon="edit" text="Edit report" onClick={(ev) => {ev.preventDefault(); createCompositeReport(reportId)}} /> : "" }
                            { inBuilt === false && type !== 'composite' ? <MenuItem icon="edit" text="Edit report" onClick={(ev) => {ev.preventDefault(); createCompositeReport(reportId)}} /> : "" }
                        </Menu>
                    }>
                        {children}
                </ContextMenu>;
        }

        return (
            <ContextMenu
                content={
                    <Menu>
                        <MenuItem icon="edit" text="Edit category" onClick={(ev) => {ev.preventDefault(); openEditCategoryDialog(catId)} } />                    
                    {inBuilt === true ? "" : <MenuItem icon="delete" text="Delete category" onClick={(ev) => {ev.preventDefault(); deleteCategory(catId)} } /> }	
                </Menu>
                }
            >
                {children}
            </ContextMenu>
        );
    }

    /**
     * Open report edit tab. This uses the same component as for creating new
     * reports. The reportId differentiates between create and edit.
     * 
     * @param {type} reportId
     * @returns {undefined}
     */
    const showEditTab = (reportId) => {
        let tabId  = 'create_report';
        
        //Close any open create tab
        dispatch(closeTab(tabId));
        dispatch(clearReportCreateState());
        
        //Fetch report details 
        dispatch(getReportInfo(reportId))
        
        //add delay before showing edit mode
        //Without this, there is 
        setTimeout(()=> {
            dispatch(addTab(tabId, 'CreateReport', {
                title: 'Edit Report',
                reportId: reportId
            }));
        },100)

                
    }
	
    /**
     * Delete report
     * 
     * @param Integer reportId report primary key
     */
    const removeReport = (reportId) => {
        dispatch(deleteReport(reportId))
    }
    
	
    /**
     * Handle change event on search input field
     * 
     * @param {type} event
     */
    const handleChangeEvent = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        switch(name){
            case 'text': 
                setText(value); 
                setFilterText(value);  
            break;
            case 'reports': 
                setReports(value);
                setFilterReports(value); 
            break;
            case 'categories':
                setCategories(value);
                setFilterCategories(value); 
            break;
			default: 
                setText(value);
                setFilterText(value);
            break;
        }
        
        updateFilter();
    }


	const openEditCategoryDialog = (categoryId) => { 
        setIsOpen(true);
		dispatch(getCategory(categoryId));		
	} 

	
    /**
     * Delete report category 
     * 
     */
    const deleteCategory = (catId) => {
        dispatch(removeCategory(catId));
    }    
	
    /**
     * Check whether list of reports provided contains atleast one matching the 
     * search string 
     * 
     * @param Array rules Array of rules
     * @param String search Search String
     * @returns {Boolean}
     */
    const catContainsMatchingReport = (_reports, search) => {
        var regex = new RegExp(search, 'i');
        for(var key in _reports){
            if ( regex.test(_reports[key].name) ) return true;
        }
        return false;
    }
    
    /**
     * Update report search 
     * 
     * @returns {undefined}
     */
    const updateFilter = () => {
        dispatch(setReportFilter(text, filterCategories, filterReports));
    }

    useEffect(() => {
        dispatch(getReports());
        updateNodes();
    }, [filterReports]);
    
    const dismissError = () => {
         dispatch(clearReportTreeError());
    }
    
   
    const showReportDataTab = (reportName, reportId) => { 
        let tabId = 'report_' + reportId + "_tab";

        console.log('showReportDataTab --->', reportName);
        
        dispatch(addTab(tabId, 'ReportContainer', {
            title: reportName,
            reportId: reportId
        }));
    }
    
    /**
     * Update tree nodes
     * 
     * @returns
     */
    const updateNodes = () => {
        nodes = [];
        
        const filterText = text;
        let filterOnReports = reports
        const filterOnCategories = categories;
        //const noFilter = filterOnReports && filterOnCategories && (filterText === '');
		
		//If nothing is selected, filter on reports
		if( !filterOnReports && !filterOnCategories && filterText !== "") filterOnReports = true
        
        for(let key in stateReports){
            let cat = stateReports[key];
            
            //Filter categories
            var regex = new RegExp(filterText, 'i');
            if( (filterText !== "" && filterOnCategories && !regex.test(cat.cat_name)) || 
                (!catContainsMatchingReport(cat.reports, filterText) && filterOnReports )
              ){ 
                continue;
            }
        
            const isExpanded = expandedNodes.indexOf(cat.cat_id) !== -1
            const icon = isExpanded === true ? "folder-open": "folder-close"
            let reportCategory = {
                id: cat.cat_id,
                hasCaret: true,
                icon: icon,
                label: <TreeContextMenu nodeId={cat.cat_id} catId={cat.cat_id} type={"folder"} inBuilt={cat.in_built} label={cat.cat_name}>{cat.cat_name}</TreeContextMenu>,
                key: cat.cat_id,
                isExpanded : isExpanded,
                catId: cat.cat_id,
				inBuilt: cat.in_built,
                childNodes: []        
            };
            
            //Get reports under category 
            for (let k in cat.reports){
                let _report = cat.reports[k];
                
                //Filter reports
                if( (filterText !== "" && filterOnReports && !regex.test(_report.name)) ){
                    continue;
                }
                
                const _reportNodeId = cat.cat_id + "-" + _report.id;
                reportCategory['childNodes'].push({
                    id: _reportNodeId,
                    label: <TreeContextMenu nodeId={_reportNodeId} reportId={_report.id} catId={_report.parent_id} type={_report.type.toLowerCase()} inBuilt={_report.in_built} label={_report.name}>{_report.name}</TreeContextMenu>,
                    labelText: _report.name,
                    icon: "document",
                    reportId: _report.id,
                    catId: cat.cat_id,
					type: _report.type.toLowerCase(),
					inBuilt: _report.in_built,
                });
            }
            nodes.push(reportCategory);

        }
    }

    /**
     * Show report table when report name is double clicked
     * 
     * @param {type} nodeData
     * @returns {undefined}
     */
    const onNodeDoubleClick = (nodeData) => {

        if(typeof nodeData.reportId !== 'undefined'){
            showReportDataTab(nodeData.labelText, nodeData.reportId);
        }
    }
    
    const handleNodeCollapse = (nodeData) => {
        const _expandedNodes = expandedNodes.filter((v,k) => v !== nodeData.catId)
        setExpandedNodes(_expandedNodes);
    };

    const handleNodeExpand = (nodeData) => {
        
        let _expandedNodes = expandedNodes;
        if(expandedNodes.indexOf(nodeData.catId) === -1 ){
            _expandedNodes.push(nodeData.catId)
        }else{
            return true;
        }
        setExpandedNodes(_expandedNodes);

        refreshReportTree();
    };

    const createReport = () => {
        let tabId  = 'create_report';
        
        //Close any open create tab
        //This is to fix a bug caused by create and edit using the same component
        dispatch(closeTab(tabId));
        dispatch(clearReportCreateState());
        
        //The delay is toe ensure the previous close has time to clean up
        setTimeout(()=>{
            dispatch(addTab(tabId, 'CreateReport', {
                title: 'Create Report'
            }));
        },10)

    }
	
	/*
	* Refresh the report tree
	*/
	const refreshReportTree = () => {
		dispatch(getReports());
	}
	
    
    const openCreateCategoryDialog = () => { 
		dispatch(clearEditCategoryState());
		dispatch(clearNewCategoryState());

        setCatName("");
        setCatNotes("");
        setCatDialogTitle("Add report category");
        setIsOpen(true);
        setNotesValue("");
	};
	
    const closeCreateCategoryDialog = () => setIsOpen(false);
    
    const handleSave = () => {
		const catId = editCat !== null ? editCat.id : null;
        dispatch(saveCategory(catName, catNotes, catId ));
        setIsSaving(true);
    }
	
	const createCompositeReport = (reportId) => {
		let tabId  = 'create_composite_report';
		
        //Close any open create tab
        //This is to fix a bug caused by create and edit using the same component
        dispatch(closeTab(tabId));
        dispatch(clearCreateCompReportState());
        
        //The delay is to ensure the previous close has time to clean up
        setTimeout(()=>{
			dispatch(addTab(tabId, 'CreateCompositeReport', {
				title: typeof reportId === 'number' ? "Edit Composite Report" : "Create Composite Report",
				options: {
					reportId: typeof reportId === 'number' ? reportId : null 
				}
			}));
			
        },10)
		
	}


    updateNodes();
                         
    //Show progress bar when report details are being fetched 
    let catDetailsLoadingProgressBar = null;
    if( editCat !== null){
        catDetailsLoadingProgressBar = editCat.requesting === true ? <ProgressBar className="mb-2"/> : "";
    }
    

    if(editCat !== null){
        setCatName(editCat.name);
        setCatNotes(editCat.notes);
        setCatDialogTitle("Edit report category");
    }
		
    return (
            
        <div>
        <div className="legend w-100 mb-2">
            <ButtonGroup minimal={true} vertical={false}>
                <Button icon="refresh" onClick={refreshReportTree} />
                <Divider/>
                <Button onClick={openCreateCategoryDialog} icon="folder-new" />
                <Divider/>
                <Button onClick={createReport} icon="plus"/>
                <Divider/>
                <Button onClick={createCompositeReport} icon="new-object"/>
            </ButtonGroup>
        </div>

        {catDetailsLoadingProgressBar}
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
                        value={text} 
                        onChange={handleChangeEvent}
                    />
                </FormGroup>
                
                <div className="mb-2">
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="inlineCheckbox1" checked={categories} name="categories" onChange={handleChangeEvent}/>
                        <label className="form-check-label" htmlFor="inlineCheckbox1">Categories</label>
                    </div>

                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="inlineCheckbox2" checked={reports} name="reports" onChange={handleChangeEvent}/>
                        <label className="form-check-label" htmlFor="inlineCheckbox2">Reports</label>
                    </div>
                </div>
        
                {requestError === null ? '': 
                    <div className="alert alert-danger mt-1 mb-1 p-2" role="alert">
                        {requestError}
                        <button type="button" className="close"  aria-label="Close" onClick={dismissError}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>     
                }
                
                {requestingReports === true ? <ProgressBar /> : ""}
                
            <Tree 
                contents={nodes}
                onNodeDoubleClick={onNodeDoubleClick}
                onNodeCollapse={handleNodeCollapse}
                onNodeExpand={handleNodeExpand}
            />
            </div>
            
			<Dialog
                icon="folder-new"
                title={catDialogTitle}
                isOpen={isOpen}
			    onClose={closeCreateCategoryDialog}
			>
			
				<div className={Classes.DIALOG_BODY}>
			
					{catDetailsLoadingProgressBar}
					
					<FormGroup
						helperText=""
						label="Category Name"
						labelFor="text-input"
						labelInfo=""
					>
					<InputGroup id="text-input" placeholder="Report category name" className='mb-1' onChange={handleCatNameChange} defaultValue={catName}/>
					</FormGroup>       
					
					<FormGroup
						helperText=""
						label="Notes"
						labelFor=""
						labelInfo=""
					>
						<TextArea
							placeholder="Report category notes"
							large={true}
							intent={Intent.PRIMARY}
							onChange={handleNotesChange}
							className='mb-1'
							fill={true}
							value={notesValue}
						/>
					</FormGroup>
					
					<Button icon="plus" intent='success' text="Save" onClick={handleSave} disabled={requesting} />  {requesting === true ? <Spinner intent={Intent.PRIMARY} size={Spinner.SIZE_SMALL}/> : ""}
				</div>
			</Dialog>
			
        </div>
    );
    
}

export default ReportsTree;