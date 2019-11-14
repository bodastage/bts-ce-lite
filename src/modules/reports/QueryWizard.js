import React from 'react'
import { connect } from 'react-redux';
//import {Query, Builder, Utils as QbUtils} from 'react-awesome-query-builder';
import { getQueryTables, getTableColumns, deleteAvailableColumn, addColumnToSelectedColumns,
	removeTableFromJoin,
	addJoinCondition,
	removeJoinCondition
} from './reports-actions';
import { 
	Select, 
	Input,
	Button as AntdButton,
	Popover as AntPopover
} from 'antd';
import { Icon } from "@blueprintjs/core";

const { Option } = Select;

class QueryWizard extends React.Component{
	
   constructor(props){
        super(props);
		
	    this.state = {
			//{right,type,left}
			joins: [], 
			
			tableSearch: '',
			availableColumnsSearch: ''
	    };
		
	}

	componentDidMount(){
		
		if(this.props.tables.length === 0){
			this.props.dispatch(getQueryTables());
		}
		
	}
	
	handleTableSearchChange = (e) => {
		this.setState({tableSearch: e.target.value});
	}
	
	handleAvailableColumnsSearchChange = (e) => {
		this.setState({availableColumnsSearch: e.target.value});
	}
	
	addTableToJoin = (tableSchema, tableName, tableIndex) => {
		 const joinIndex = this.props.joins.length; 
		 const tableAlias = `tl${joinIndex}`;
		
		const joinCondition = {
			right: {
				tableSchema: tableSchema,
				tableName: tableName,
				alias: tableAlias,
				tableIndex: tableIndex
			},
			type: null,
			left: null
		}
		//this.setState({joins: [...this.state.joins, joinCondition]});
		
		
		this.props.dispatch(addJoinCondition(joinCondition));
		this.props.dispatch(getTableColumns(tableSchema, tableName, joinIndex, tableAlias));
	}
	
	removeJoin = (index) => {
		//let joins = this.state.joins;
		//joins.splice(index, 1);
		//this.setState({joins: joins});	
		
		this.props.dispatch(removeJoinCondition(index));
	}
	
	removeAvailableColumn = (index) => {
		this.props.dispatch(deleteAvailableColumn(index));
	}
	
	addToSelectedColumn = (index) => {
		this.props.dispatch(addColumnToSelectedColumns(index));
	}
	
	render(){

		const OPTIONS = this.props.tables.map( (v, vIdx) => <Option value={`${v.table_schema}.${v.table_name}`}>{`${v.table_schema}.${v.table_name}(tl${vIdx})`}</Option>);
		
		return (
			<div className="container mb-2">
				<div className="row mb-2">
					<div className="col-6 pl-0">
						<div><Icon icon="th" /> Tables</div>
						<div><Input onChange={this.handleTableSearchChange}/></div>
						<div style={{overflowY: "scroll", height: "250px"}}>
							{this.props.tables
							.filter(v => {
								const tableName = `${v.table_schema}.${v.table_name}`;
								const regExpTest = new RegExp(this.state.tableSearch, "i").test(tableName);
								
								if(this.state.tableSearch.length === 0 || regExpTest) return true;
								
								return false;
							})
							.map(v => {
								const tableName = `${v.table_schema}.${v.table_name}`;
								return (
								<div>
									<Icon icon="add" onClick={() => this.addTableToJoin(v.table_schema, v.table_name, v.tableIndex)}/> 
									&nbsp;
									{`${v.table_schema}.${v.table_name}`}
								</div>
								);
							}
							)}
						</div>
					</div>
					<div className="col-6 pr-0">
						<div><Icon icon="join-table"/> Joins</div>
						<div><Input /></div>
						<div>
						{this.props.joins.map((v, index) => 
							<div>
								<Icon icon="remove" onClick={() => this.removeJoin(index)}/> &nbsp;
								{`${v.right.tableSchema}.${v.right.tableName}(tl${v.joinIndex})`}
								&nbsp;<Icon icon="inner-join" /> &nbsp;
								<Select 
									showSearch
									style={{ width: 200 }}
									size="small"
									filterOption={(input, option) =>
										option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}
								>
									{OPTIONS}
								</Select>
							</div>
						)}
						</div>
					</div>
				</div>
				
				<div className="row">
					<div className="col-6 pl-0">
						<div>Available Columns</div>
						<div><Input /></div>
						<div style={{overflowY: "scroll", height: "250px"}}>
							{this.props.availableColumns.map((v, index) => (
								<div>
									<Icon icon="add" onClick={() => this.addToSelectedColumn(index)}/> 
									&nbsp;
									{
										//`${v.table_schema}.${v.table_name}.${v.column_name}`
									}
									{`${v.tableAlias}.${v.column_name}`}
								</div>
							))}
						</div>
					</div>
					<div className="col-6 pr-0">
						<div>Selected Columns</div>
						<div><Input /></div>
						<div></div>
					</div>
				</div>
				
			</div>
		);
	}
}

function mapStateToProps(state, ownProps){
	return {
		tables: state.reports.qrywiz.tables || [],
		availableColumns: state.reports.qrywiz.availableColumns || [],
		selectedColumns: state.reports.qrywiz.selectedColumns || [],
		joins: state.reports.qrywiz.joins || []
	}
}

export default connect(mapStateToProps)(QueryWizard);