import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { Button, ResizeSensor, Spinner, Icon, Intent,
		 MenuItem, Menu, FormGroup, InputGroup } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import '../../../node_modules/react-grid-layout/css/styles.css'
import '../../../node_modules/react-resizable/css/styles.css'
import GridLayout from 'react-grid-layout';
import './composite-report-stats.css'
import { getReportInfo, getCompReportInfoForEdit, addToCompositeReport, updateCompositeLayout,
		saveCompositeReport, loadCompReportInfoForEdit, clearCreateCompReportState } 
		from './reports-actions';
import CompositeReportContainer from './CompositeReportContainer';

class CreateCompositeReport extends React.Component {
    static icon = "chart-line";
    static label = "Performace"
	
    
    constructor(props){
        super(props);
        
        const initPanelHeight = (window.innerHeight - 150)/2 - 30
        this.state = {
            width: 1200,
            rowHeight: (window.innerHeight - 150)/4,
            mapHeight: initPanelHeight,
            keyHeight: initPanelHeight,
            dataHeight: initPanelHeight,
            graphHeight: initPanelHeight,
            fields: [],
            countsUpdated: false,
			
			//@TODO: This is not used. Should be removed.
			name: this.props.options.name || "Composite report",
			notes: "Composite report notes ",
			
			category: this.props.categories[0],
        }
        
        this.handleResize = this.handleResize.bind(this)
        this.onLayoutChange = this.onLayoutChange.bind(this)
		
        //Category Select
        this.reportItemRenderer = this.reportItemRenderer.bind(this)
        this.handleReportValueChange = this.handleReportValueChange.bind(this)
		this.addReport = this.addReport.bind(this)
		this.removeReport = this.removeReport.bind(this)
		this.handleNameChange = this.handleNameChange.bind(this)
		this.saveReport = this.saveReport.bind(this)
		
		//Category Select
        this.categoryItemRenderer = this.categoryItemRenderer.bind(this)
        this.handleCategoryValueChange = this.handleCategoryValueChange.bind(this)
                
				
		this.reportName = "Composite report" || this.props.options.title;
		
		//
		//
		if(typeof this.props.options.options.reportId === 'number'){
			const reportId = this.props.options.options.reportId;
			
			this.state.category = this.props.categories.filter( v => v.id === this.props.reportsInfo[reportId].category_id)[0]
			this.reportName = this.props.reportsInfo[reportId].name;
		}else{
			this.state.category = this.props.categories[0]
		}
   }

    componentDidMount(){
		if( typeof this.props.options.options.reportId === 'number' ){
			this.props.dispatch(getCompReportInfoForEdit(this.props.options.options.reportId))
		}
	}
	
	componetDidUnmount(){
		if( typeof this.props.options.options.reportId === 'number' ){
			this.props.dispatch(clearCreateCompReportState())
		}
	}
	
	handleNameChange(event){
        this.reportName = event.target.value;
    }
    
    handleCategoryValueChange(category) { 
        this.setState({ category: category});
    }
	
    handleResize(resizeEntries){
		const width = resizeEntries[0].contentRect.width;
        this.setState({width: width === 0 ? this.state.width: width })
    }
   
    
    handleReportValueChange(report) { 
        this.setState({ report: report});
    }
	
    reportItemListRenderer({items, itemsParentRef, query, renderItem}){
        const renderedItems = items.map(renderItem).filter(item => item != null);
        return (
            <Menu ulRef={itemsParentRef}>
                <MenuItem
                    disabled={true}
                    text={`Found ${renderedItems.length} items matching "${query}"`}
                />
                {renderedItems}
            </Menu>
        );
    }
	
    reportItemPredicate(query, report){
        return report.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
    }
	
    /**
     * 
     *@TODO: Request list from server 
     * 
     * @param {type} items
     * @param {type} itemsParentRef
     * @param {type} query
     * @param {type} renderItem
     * @returns {itemsParentRef@var;renderedItems|String|Boolean}
     */
   
    renderReportList(items, itemsParentRef, query, renderItem){
        const renderedItems = items.map(renderItem).filter(item => item != null);
        return (
            <Menu ulRef={itemsParentRef}>
                <MenuItem
                    disabled={true}
                    text={`Found ${renderedItems.length} items matching "${query}"`}
                />
                {renderedItems}
            </Menu>
        );
    }
	
    reportItemRenderer( report, {handleClick, modifiers} ){
        if (!modifiers.matchesPredicate) {
                return null;
            }
            return (
                <MenuItem
                    active={modifiers.active}
                    key={report.id}
                    label=""
                    onClick={handleClick}
                    text={report.name}
                />
            );
    }
	
    renderCategoryList(items, itemsParentRef, query, renderItem){
        const renderedItems = items.map(renderItem).filter(item => item != null);
        return (
            <Menu ulRef={itemsParentRef}>
                <MenuItem
                    disabled={true}
                    text={`Found ${renderedItems.length} items matching "${query}"`}
                />
                {renderedItems}
            </Menu>
        );
    }
    
    categoryItemListRenderer({items, itemsParentRef, query, renderItem}){
        const renderedItems = items.map(renderItem).filter(item => item != null);
        return (
            <Menu ulRef={itemsParentRef}>
                <MenuItem
                    disabled={true}
                    text={`Found ${renderedItems.length} items matching "${query}"`}
                />
                {renderedItems}
            </Menu>
        );
    }
    categoryItemPredicate(query, category){
        return category.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
    }
    categoryItemRenderer( category, {handleClick, modifiers} ){
        if (!modifiers.matchesPredicate) {
                return null;
            }
            return (
                <MenuItem
                    active={modifiers.active}
                    key={category.id}
                    label=""
                    onClick={handleClick}
                    text={category.name}
                />
            );
    }
	
	/**
	* Add report to collection
	*
	*/
	addReport(){
		if(typeof this.state.report === 'undefined') return; //@todo: show error message 

		
		const compReportId = null;
		const reportId = this.state.report.id;
		
		//@TODO: Check if the id alreay exists 
		if(this.props.options.layout.filter(v => v.i === `${reportId}`).length > 0 ) return;
		
		const options = {
			layout: {i: `${reportId}`, x: 0, y: 0, w: 2, h: 2},
			name: this.state.name,
			type: 'Composite'
		}
		
		this.props.dispatch(addToCompositeReport(compReportId, reportId, options));
	}
	
	removeReport(key){
		const lyt = this.props.options.layout.filter((v) => v.i !== "z" && v.i !== key);
		this.props.dispatch(updateCompositeLayout(lyt));
	}
	
	
	saveReport(){
		let compReportId = null;
		if( typeof this.props.options.options.reportId === 'number' ){
			compReportId = this.props.options.options.reportId
		}
			
		const name = this.reportName;  
		const catId = this.state.category.id 
		const options = {
			layout: this.props.options.layout
		}
		
		this.props.dispatch(saveCompositeReport(compReportId, name, catId, options));
	}
	/**
	*
	*/
    onLayoutChange(layout){
		const lyt = layout.filter((v) => v.i !== "z");
		this.props.dispatch(updateCompositeLayout(lyt));
    }
	
    render(){

		const colCount = this.props.options.columns;
		
		let activeItem   = this.state.category;
		let category   = this.state.category;
		

		//Add box with add button
		//let rows = this.layout.length === 0 ? 0 : layout.length/colCount;
		//layout.push({i: 'z', x: 0, y: 0, w: 2, h: 2});
		
		let currentGridBoxes = this.props.options.layout.map((val) => {
			
			if(typeof this.props.reportsInfo[val.i] === 'undefined'){
				this.props.dispatch(getReportInfo(val.i));
				return (
				<div key={val["i"]} className="rgl-border">
					<div className="card-header ">Loading ...
						<a href="/#" title="Remove report">
							<Icon icon="delete" className="float-right ml-2" onClick={(e) => { e.preventDefault(); this.removeReport(val.i);}}/>
						</a>&nbsp;
					</div>
					<div className="rgl-body">
						<div className="mt-2 pb-3" style={{height: this.state.rowHeight*val.h-20}}>
							<Spinner size="20"/>
						</div>
					</div>
				</div>
				);
			}
			
			return (
			<div key={val["i"]} className="rgl-border">
				<div className="card-header ">{this.props.reportsInfo[val.i].name} 
					<a href="/#" title="Remove report">
						<Icon icon="delete" className="float-right ml-2" onClick={(e) => { e.preventDefault(); this.removeReport(val.i);}}/>
					</a>&nbsp;
				</div>
				<div className="rgl-body">
					<div className="mt-2 pb-3" style={{height: this.state.rowHeight*val.h-20}}>
						<CompositeReportContainer options={{reportId: val.i, title: this.props.reportsInfo[val.i].name}}/>
					</div>
				</div>
			</div>);
		})
		
		const gridBoxes = [...currentGridBoxes, 
			(<div key="z" className="rgl-border">
				<div className="card-header ">Select report to add </div>
				<div align="center">
					<div className="mt-5">
                    <Select 
                        key={this.nameRedraw}
                        noResults={<MenuItem disabled={true} text="No categories." />}
                        items={this.props.reports}
                        itemListRenderer={this.reportItemListRenderer}
                        itemRenderer={this.reportItemRenderer}
                        itemPredicate={this.reportItemPredicate}
                        onItemSelect={this.handleReportValueChange}
                        activeItem={this.activeItem}
                        initialContent={<MenuItem disabled={true} text="Report" />}
                            >					
                        <Button
                            icon="folder-close"
                            rightIcon="caret-down"
                            text={this.state.report ? `${this.state.report.name}` : "(No selection)"}
                            disabled={false}
                        />        
                    </Select> 
					&nbsp;
					<Button text="Add" icon="plus" onClick={this.addReport}/>
					
					</div>
				</div>
			</div>)
		];
		
		const addBoxRow = this.props.options.layout.length === 0 ? 0 : Math.ceil(this.props.options.layout.length/colCount) + 1
		const layout = [...this.props.options.layout, {i: 'z', x: 0, y: addBoxRow, w: 2, h: 2}];
		//layout.push({i: 'b', x: 3, y: 0, w: 2, h: 2})
		
		//When editing, show spinner as we wait for the report info to be loaded in the state
		if(typeof this.props.options.options.reportId === 'number' && this.props.options.edit === null ){
			const reportId = this.props.options.options.reportId;
			if(typeof this.props.reportsInfo[reportId] !== 'undefined'){
				if(typeof this.props.reportsInfo[reportId].id !== 'undefined'){
					this.props.dispatch(loadCompReportInfoForEdit(reportId));
				}
			}

			return (
			<fieldset className="col-md-12 fieldset">    	
				<legend className="legend"><Icon icon="control"/> {this.props.options.title}</legend>
				<Spinner />
			</fieldset>
			);
		}
		
		
		if(typeof this.props.options.options.reportId === 'number'){
			const reportId = this.props.options.options.reportId;
			
			//this.state.category = this.props.categories.filter( v => v.id === this.props.reportsInfo[reportId].category_id)[0]
			this.reportName = this.props.reportsInfo[reportId].name;
		}else{
			//this.state.category = this.props.categories[0]
		}
		
		
       return (

			<fieldset className="col-md-12 fieldset">    	
				<legend className="legend"><Icon icon="control"/> {this.props.options.title}</legend>
                    
           <div>
		   
			<FormGroup
				helperText=""
				label="Report Name"
				labelFor="text-input"
				labelInfo=""
			>
			<InputGroup id="text-input" placeholder="Report name" className='mb-1' onChange={this.handleNameChange} defaultValue={this.reportName} key={this.nameRedraw}/>
			</FormGroup>

			<FormGroup>
                    <Select 
                        key={this.nameRedraw}
                        noResults={<MenuItem disabled={true} text="No categories." />}
                        items={this.props.categories}
                        itemListRenderer={this.categoryItemListRenderer}
                        itemRenderer={this.categoryItemRenderer}
                        itemPredicate={this.categoryItemPredicate}
                        onItemSelect={this.handleCategoryValueChange}
                        activeItem={this.state.category}
                        initialContent={<MenuItem disabled={true} text="Category" />}
                            > &nbsp;
                        <Button
                            icon="folder-close"
                            rightIcon="caret-down"
                            text={category ? `${category.name}` : "(No selection)"}
                            disabled={false}
                            className="mr-2"
                        />        
                    </Select>
					
					<Button icon="play" text="Save report"  onClick={this.saveReport} intent={Intent.PRIMARY}/>  
			</FormGroup>
			
		   <ResizeSensor onResize={this.handleResize}>
            <GridLayout className="layout" 
                onLayoutChange={this.onLayoutChange}
				draggableHandle=".card-header"
				layout={layout} 
				cols={colCount} 
				margin={[2,2]}
				rowHeight={this.state.rowHeight} width={this.state.width}>

				  {gridBoxes}
              
            </GridLayout>
          </ResizeSensor></div>
		  </fieldset>
        )
	}
}


function mapStateToProps(state, ownProps){
	
	let reports = []
	state.reports.reports.forEach((cat, i) => {
		cat.reports.forEach(rpt => {
			reports.push({ id: rpt.id, name: cat.cat_name + "/" + rpt.name });
		});
	});

    return {
		options: { ...state.reports.compReport, ...ownProps.options},
		reports: reports,
		categories: state.reports.reports.map(r => ({id: r.cat_id, name: r.cat_name}) ),
		reportsInfo: state.reports.reportsInfo
    };
}

export default connect(mapStateToProps)(CreateCompositeReport);