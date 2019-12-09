import React from 'react'
import { connect } from 'react-redux';
//import {Query, Builder, Utils as QbUtils} from 'react-awesome-query-builder';
import { 
	getQueryTables, 
	getTableColumns, 
	deleteAvailableColumn, 
	addColumnToSelectedColumns,
	removeTableFromJoin,
	addJoinCondition,
	removeJoinCondition,
	deleteFromSelectedColumn,
	updateJoinType,
	addConditionToJoinClause,
	deleteConditionClause
} from './reports-actions';
import { 
	Select, 
	Input,
	Button as AntdButton,
	Popover as AntPopover
} from 'antd';
import { 
	Icon,
	Switch,
	Collapse,
	HTMLSelect
	} from "@blueprintjs/core";
import { 
	Query, 
	Builder, 
	Utils as QbUtils
} from 'react-awesome-query-builder';
import config from './queryBuilderConsts';
import JoinConditions from './JoinConditions';

const { Option } = Select;


class QueryWizard extends React.Component{
	
   constructor(props){
        super(props);
		
	    this.state = {
			tableSearch: '',
			availableColumnsSearch: '',
			
			//
			isTableConfigOpen: false,
			isColumnsConfigOpen: false
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
		 const tableAlias = `t${joinIndex}`;
		
		const joinCondition = {
			table: {
				tableSchema: tableSchema,
				tableName: tableName,
				alias: tableAlias,
				tableIndex: tableIndex
			},
			type: 'INNER',
			conditions:[
			{
				left: this.props.availableColumns[0],
				right: this.props.availableColumns[0]
			}]
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
	
	removeFromSelectedColumnList = (index) => {
		this.props.dispatch(deleteFromSelectedColumn(index));
	}
	
	onRightTableJoinChange = (value, index) => {
		console.log("value:", value, "index:", index);
	}
	
	showTableConfig = () => this.setState({isTableConfigOpen: !this.state.isTableConfigOpen});
	
	showColumnsConfig = () => this.setState({isColumnsConfigOpen: !this.state.isColumnsConfigOpen});
	
	generateQuery = () => {
		
		var qry = "SELECT \n"
		qry += this.props.selectedColumns.map(v => {
			return v.data_type === 'jsonb' && v.data_field !== undefined ? 
				`${v.tableAlias}.${v.data_field}->>'${v.column_name}' AS "${v.column_name}"` : 
				`${v.tableAlias}.${v.column_name} AS "${v.column_name}"` ;
		}).join(",\n");
		
		if(this.props.selectedColumns.length === 0 ){
				qry += " * ";
		} 
		
		qry += this.props.joins.map((v,i) => {
			const tableAlias = "t" + i;
			let fromWord = "\nFROM "
			let onStmt = "";
			if(i > 0) { 
				fromWord = `${v.type} JOIN `;
				onStmt = " \n    ON ";
			}
			
			//join clause conditions 
			const joinClauseConds = v.conditions.map(vJ => {
				const leftColumn  = vJ.left.data_type === 'jsonb' && vJ.left.data_field !== undefined ? 
				`${vJ.left.tableAlias}.${vJ.left.data_field}->>'${vJ.left.column_name}'` : 
				`${vJ.left.tableAlias}.${vJ.left.column_name}`;

				const rightColumn  = vJ.right.data_type === 'jsonb' && vJ.right.data_field !== undefined ? 
				`${vJ.right.tableAlias}.${vJ.right.data_field}->>'${vJ.right.column_name}'` : 
				`${vJ.right.tableAlias}.${vJ.right.column_name}`;
				
				return `${leftColumn} = ${rightColumn}`;
			}).join(' \n    AND ');
			
			return `${fromWord} ${v.table.tableSchema}."${v.table.tableName}" ${tableAlias} ${onStmt} ${joinClauseConds}`;
			
			
			
		}).join('\n');

		return qry;
	}
	
	componentDidUpdate = (prevProps, prevState, snapshot) => {
		const sql = this.generateQuery();
		if( typeof this.props.onChange === 'function') this.props.onChange(sql);
	}
	
	/**
	* Handle change in select join type 
	* 
	* @param integer joinIndex
	* @param joinType String 
	*/
	handleJoinType = (joinIndex, joinType) => {
		this.props.dispatch(updateJoinType(joinIndex, joinType));
	}
	
	getChildren(props) {
        return (
            <div>
                <div className="query-builder">
                    <Builder {...props} />
                </div>
            </div>
        )
    }

	/*
	* Add join clause condition
	*/
	addJoinClauseCondition = (joinIndex, joinClause) => {
		this.props.dispatch(addConditionToJoinClause(joinIndex, joinClause));
	}
	
	/**
	* Remove clause from condition 
	* @param integer joinIndex 
	* @param integer joinClauseIndex
	*/
	removeConditionClause = (joinIndex, vClauseIndex) => {
		console.log("removeConditionClause-- joinIndex:", joinIndex, " vClauseIndex:", vClauseIndex );
		this.props.dispatch(deleteConditionClause(joinIndex, vClauseIndex));
	}
	
	render(){

		const OPTIONS = this.props.tables.map( (v, vIdx) => <Option value={`${v.table_schema}.${v.table_name}`}>{`${v.table_schema}.${v.table_name}`}</Option>);
		
		this.config = {
			...config,
			conjunctions: { AND: config.conjunctions.AND },
			fields: this.props.availableColumns.reduce((result1, item1, index1, array1) => {
			
			const label = item1.data_type === 'jsonb' && item1.data_field !== undefined ? 
									`${item1.tableAlias}.${item1.data_field}->>${item1.column_name}` :
										`${item1.tableAlias}.${item1.column_name}`;
			const key = `${item1.tableAlias}_${item1.column_name}`;
										
			result1[key] = {
				label: label,
				type: 'text',
				defaultOperator: 'equal',
				operators: [
					"equal"
				]
			};

			return result1;
			}, {}),
		}
		

		
		return (
			<div className="container mb-2">
				<div className="row mb-2">
					<Switch checked={this.state.isTableConfigOpen} label="Configure tables" onChange={this.showTableConfig} />
				</div>
				
				<Collapse isOpen={this.state.isTableConfigOpen}>
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
							.map((v, vIdx) => {
								const tableName = `${v.table_schema}.${v.table_name}`;
								return (
								<div key={vIdx}>
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
									{ index === 0 ? <Icon iconSize={16} icon="full-circle" /> : <Icon icon="inner-join" />} &nbsp;
								{`${v.table.tableSchema}.${v.table.tableName}(t${v.joinIndex})`}
								
								{index === 0 ? "" : (<span> &nbsp;
									<Select size="small" style={{width: 150}} 
											defaultValue="INNER"
											onChange={(value) => this.handleJoinType(index, value)}>
										<Option value="INNER">INNER</Option>
										<Option value="LEFT">LEFT</Option>
										<Option value="RIGHT">RIGHT</Option>
									</Select>
									<Icon icon="chevron-right" />
									</span>)}
									
									<br/>
									
									{
										//Join clause conditions 
										v.conditions.map((vClause, vClauseIndex) => (<span>
											<Icon icon="small-minus" onClick={() => this.removeConditionClause(index, vClauseIndex)}/>
											<span>{`${vClause.left.tableAlias}.${vClause.left.column_name} == ${vClause.right.tableAlias}.${vClause.right.column_name}`}</span><br/>
										</span>))
										
									}
									
									{//Join condition clause 
										index === 0 ? "" :
										<JoinConditions  onChange={(joinClause) => this.addJoinClauseCondition(index, joinClause)}/>
									}
								
							</div>
						)}
						</div>
					</div>
				</div>
				</Collapse>
				
				<div className="row mb-2">
					<Switch checked={this.state.isColumnsConfigOpen} label="Configure columns" onChange={this.showColumnsConfig} />
				</div>
				
				<Collapse isOpen={this.state.isColumnsConfigOpen}>
				<div className="row">
					<div className="col-6 pl-0">
						<div>Available Columns</div>
						<div><Input /></div>
						<div style={{overflowY: "scroll", height: "250px"}}>
							{this.props.availableColumns.map((v, index) => (
								<div>
									<Icon icon="add" onClick={() => this.addToSelectedColumn(index)}/> 
									&nbsp;
									{v.data_type === 'jsonb' && v.data_field !== undefined ? 
									`${v.tableAlias}.${v.data_field}->>${v.column_name}` :
										`${v.tableAlias}.${v.column_name}`}
								</div>
							))}
						</div>
					</div>
					<div className="col-6 pr-0">
						<div>Selected Columns</div>
						<div><Input /></div>
						<div style={{overflowY: "scroll", height: "250px"}}>
							{this.props.selectedColumns.map((v, index) => (
								<div>
									<Icon icon="remove" onClick={() => this.removeFromSelectedColumnList(index)}/> 
									&nbsp;
									<Icon icon="properties" iconSize={12}/>
									&nbsp;
									{v.data_type === 'jsonb' && v.data_field !== undefined ? 
									`${v.tableAlias}.${v.data_field}->>${v.column_name}` :
										`${v.tableAlias}.${v.column_name}`}
								</div>
							))}
						</div>
					</div>
				</div>
				</Collapse>
				
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