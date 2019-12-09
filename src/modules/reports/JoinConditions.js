import React from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
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
	
const { Option } = Select;

class JoinConditions extends React.Component{
	constructor(props){
		super(props);
		
		const left = this.props.availableColumns.length === 0 ? null : this.props.availableColumns[0];
		const right = left;
		
		this.state = {
			left: left,
			right: right
		}
	}
	
	onChange = () => {
		this.props.onChange({...this.state})
	}
	
	saveConditions = () => {
		this.props.onChange({...this.state})
	}
	
	handleLeftColumn = (e) => { 
		const value = JSON.parse(e.target.value);
		this.setState({left: value}) 
	}
	
	handleRightColumn = (e) => { 
		const value = JSON.parse(e.target.value);
		this.setState({right: value}) 
	}
	
	render(){
		return (<div>
					<HTMLSelect 
						options={this.props.availableColumns.map(avL => { 
						
						return { 
							label: `${avL.tableAlias}.${avL.column_name}`,
							value: JSON.stringify(avL)
							//...avL
						};
						})}
						onChange={this.handleLeftColumn}
					/>
					==
					<HTMLSelect 
						options={this.props.availableColumns.map(
							avR => { 
								return {
									label: `${avR.tableAlias}.${avR.column_name}`, 
									value: JSON.stringify(avR)
							};} 
							)}
						onChange={this.handleRightColumn}
						/>
				
					<Icon icon="tick-circle" onClick={this.saveConditions}/>
			</div>);
	}
}

JoinConditions.propTypes = {
	onChnage :  PropTypes.func,
	fields : PropTypes.array 
}

function mapStateToProps(state, ownProps){
	return {
		availableColumns: state.reports.qrywiz.availableColumns || [],
		joins: state.reports.qrywiz.joins || []
	}
}

export default connect(mapStateToProps)(JoinConditions);