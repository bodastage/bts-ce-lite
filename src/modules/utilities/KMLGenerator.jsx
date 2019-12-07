import React, { Fragment } from 'react'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Query, Builder, Utils as QbUtils} from 'react-awesome-query-builder';
import { 
	Select, 
	Input,
	Button as AntdButton,
	Popover as AntPopover
} from 'antd';
import { 
	FileInput,
	Button,
	Icon,
	ProgressBar,
	Intent
	} from "@blueprintjs/core";
import { kmlGetDataHeaders, kmlExtractingHeaders } from './kml-actions';
import config from './queryBuilderConsts';
import 'react-awesome-query-builder/css/styles.scss';
import 'react-awesome-query-builder/css/compact_styles.scss';
import 'react-awesome-query-builder/css/denormalize.scss';
import './kml.css';

const { Option } = Select;
const { shell } = window.require('electron').remote;
const { ipcRenderer} = window.require("electron")
const fs = window.require('fs');

const FOLDER_VALUE_TYPES = ["Value", "Field"];
const VALUE_TYPES = ["Value", "Field", "Condition"];
const DEFAULT_COLOR =  '#3281a8';


class Folder extends React.Component{
	constructor(props){
		super(props);
		
		this.state = {
			valueType: this.props.defaultValue.valueType || 'Value', //Value or Field
			value: this.props.defaultValue.value || ""
		};
		
		this.config = {
			...config
		}
		
	}
	
	handleValueTypeChange = (value) => { 
		this.setState({valueType: value}) 
			
		this.props.onChange({
			value: this.state.value,
			valueType: value
		});
	};
	
	handleFieldValueChange = (value) => { 
		this.setState({value: value});
		
		this.props.onChange({
			value: value,
			valueType: this.state.valueType
		});
	}
				
	handleInputValueChange = (e) => {
		this.setState({value: e.target.value});
		
		this.props.onChange({
			value: e.target.value,
			valueType: this.state.valueType
		});
	}
	
	render(){
		
		let ValueField = (
			<Input placeholder="Value" onChange={this.handleInputValueChange} disabled={this.props.disabled}/>
		);
		
		if( this.state.valueType === 'Field'){
			ValueField = (
				<Select 
					defaultValue={this.state.valueType} 
					style={{ width: 250 }} 
					onChange={this.handleFieldValueChange}
					disabled={this.props.disabled}
				>
				  {this.props.fields.map(v => (
					<Option value={v} key={v}>{v}</Option>
				  ))}
				</Select>
			);
		}
		
		return (
		<div className="row">
			<div className="col-12">
				<div className="row">
					<div className="col-2 mb-2">
						<Select 
							defaultValue={this.state.valueType} 
							style={{ width: 120 }} 
							onChange={this.handleValueTypeChange}
							disabled={this.props.disabled}>
						  {FOLDER_VALUE_TYPES.map(v => (
							<Option value={v} key={v}>{v}</Option>
						  ))}
						</Select>
						
					</div>
					<div className="col-6">
						{ValueField}
					</div>
				</div>
			</div>
		</div>
		);
	}
}



class HeightValue extends React.Component{
	constructor(props){
		super(props);
		
		this.state = {
			valueType: 'Value',
			value: 10,
			
			//Condition
			conditionValueType: 'Value',
			conditionValue: 10,
			conditionList: [
			
			]
		};

	}
	
	handleValueTypeChange = (value) => { 
		let defaultValue = null;
		let defConditionValue = 10;
		let defConditionValueType = 'Value';
		
		if(value === 'Field') defaultValue = this.props.fields[0] || null;
		if(value === 'Value') defaultValue = 10;
		if(value === 'Condition'){
			defConditionValue = 10
		}
		
		this.setState({
			valueType: value, 
			value: defaultValue,
			conditionValue: defConditionValue,
			conditionValueType: defConditionValueType
		});
		
		this.props.onChange({
			valueType: value,
			value: value === 'Condition' ? this.state.conditionList : defaultValue
		});
		
	};
	
	handleFieldValueChange = (value) => { 
		this.setState({value: value}); 
		this.props.onChange({
			valueType: 'Field',
			value: value
		});
	}
	
	handleConditionValueTypeChange = (value) => { 
	
		let defaultValue = null;
		
		if(value === 'Field') defaultValue = this.props.fields[0] || null;
		if(value === 'Value') defaultValue = 10;
		
		this.setState({conditionValueType: value, conditionValue: defaultValue}) 
	};
	
	onQueryBuilderChange = (tree) => {
		
		this.setState({value: tree});
	}
	
	addCondition = () => {
		this.setState({
			conditionList: [ 
				...this.state.conditionList,
				{ 
					tree: this.state.value, 
					value: this.state.conditionValue,
					valueType: this.state.conditionValueType
				}
			]
		});
		
		this.props.onChange({
			valueType: 'Condition',
			value: [ 
				...this.state.conditionList,
				{ 
					tree: this.state.value, 
					value: this.state.conditionValue,
					valueType: this.state.conditionValueType
				}
			]
		});
	}
	
	handleConditionValueChange = (e) => this.setState({conditionValue: e.target.value });
	
	handleConditionFieldValueChange = (value) => this.setState({conditionValue: value});
	
	deleteConditionRule = (index) => {
		let conditionList = this.state.conditionList;
		conditionList.splice(index, 1);
		this.setState({conditionList: conditionList});
		
		this.props.onChange({
			valueType: 'Condition',
			value: conditionList
		});
		
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
	
	handleInputValueChange = (e) => {
		this.props.onChange({
			value: e.target.value,
			valueType: 'Value'
		});
	}
				
	render(){
		
		const valueTypeHelpContent = (
			<div>
				The value can be : Value, Field, or Condition. 
				<ul>
					<li>The <b>Value</b> type requires you to input a value. </li>
					<li>The <b>Field</b> type picks the value from a column in the data file. </li>
					<li>The <b>Condition</b> type allows you to specify a value depending on a series of conditions. </li>
				</ul>

			</div>
		);
		
		//Update config
		this.config = {
			...config,
			
			fields: this.props.fields.reduce((result1, item1, index1, array1) => {
				
				result1[item1] = {
					label: item1,
					type: 'text',
					defaultOperator: 'equal',
					operators: [
						"equal",
						"not_equal",
						"less",
						"less_or_equal",
						"greater",
						"greater_or_equal",
						"between",
						"not_between",
						"is_empty",
						"is_not_empty",
						"starts_with",
						"ends_with",
						"regexp"
					]
				};

				return result1;
			}, {}),
			
		};
		
		
		let ValueField = (
			<Input placeholder="Value" 
				defaultValue={this.state.value} 
				onChange={this.handleInputValueChange}
				style={{width: '50%'}}
				disabled={this.props.disabled}
			/>
		);
		
		if( this.state.valueType === 'Field'){
			ValueField = (
				<Select 
					defaultValue={this.state.value} 
					style={{ width: 250 }} 
					onChange={this.handleFieldValueChange}
					disabled={this.props.disabled}>
				  {this.props.fields.map(v => (
					<Option value={v} key={v}>{v}</Option>
				  ))}
				</Select>
			);
		}
		
		if( this.state.valueType === 'Condition'){
			ValueField = (
			<Fragment>
				<div className="row">
					<div className="col-12">
					<ol>
				{
					this.state.conditionList.map((cond, tIdx) => (
						<li key={tIdx}>
							<Icon icon="remove" onClick={() => this.deleteConditionRule(tIdx)} /> &nbsp;
							Height = <strong/>{cond.value}<strong/> IF {QbUtils.queryString(cond.tree, this.config)} 
						</li>
					))
				}
					</ol>
					
					{this.state.conditionList.length > 0 ? (<div className="mb-2" style={{borderBottom: "1px solid #cccccc"}}></div>) : ""}
					
					</div>
				</div>
			
				<div className="row">
					<div className="col-8">
						<Query 
						  disabled={this.props.disabled}
						  {...this.config} 
						  //you can pass object here, see treeJSON at onChange
						  //value=transit.fromJSON(treeJSON)
						  get_children={this.getChildren}
						  onChange={this.onQueryBuilderChange}
						></Query>
					</div>
					<div className="col-4" style={{borderLeft: "1px solid #cccccc"}}>
						<div className="mb-1">
							<Select 
								disabled={this.props.disabled}
								size="small"
								defaultValue={this.state.conditionValueType} 
								style={{ width: 120 }} 
								onChange={this.handleConditionValueTypeChange}>
							  {["Value", "Field"].map(v => (
								<Option value={v} key={v}>{v}</Option>
							  ))}
							</Select>
						</div>
						{this.state.conditionValueType === 'Value' ? (
							<Input 
								disabled={this.props.disabled}
								placeholder="Value" 
								defaultValue={this.state.conditionValue}
								size="small"
								onChange={this.handleConditionValueChange}
							/>
						) : (
							<Select 
								disabled={this.props.disabled}
								size="small"
								defaultValue={this.state.conditionValue} 
								style={{ width: 250 }} 
								onChange={this.handleConditionFieldValueChange}>
							  {this.props.fields.map(v => (
								<Option value={v} key={v}>{v}</Option>
							  ))}
							</Select>
						)}
						
						
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						<AntdButton 
							size="small" 
							onClick={this.addCondition}
							disabled={this.props.disabled}>Add condition</AntdButton>
					</div>
				</div>
			</Fragment>
			);
		}
		
		return (
			<div className="col-12">
				<div className="mb-2">
					<Select 
						disabled={this.props.disabled}
						defaultValue={this.state.valueType} 
						style={{ width: 120 }} 
						onChange={this.handleValueTypeChange}>
					  {VALUE_TYPES.map(v => (
						<Option value={v} key={v}>{v}</Option>
					  ))}
					</Select> &nbsp;
					<AntPopover 
						content={valueTypeHelpContent}
						title={"? Value Type"}
					>
						<Icon icon="info-sign" />
					</AntPopover>
				</div>
				<div className="mb-2">
					{ValueField}
				</div>

			</div>
		);
	}
}


class RadiusValue extends React.Component{
	constructor(props){
		super(props);
		
		this.state = {
			valueType: 'Value',
			value: 10,
			
			//Condition
			conditionValueType: 'Value',
			conditionValue: 10,
			conditionList: [
			
			]
		};
		
	}
	
	handleValueTypeChange = (value) => { 
		let defaultValue = null;
		let defConditionValue = 10;
		let defConditionValueType = 'Value';
		
		if(value === 'Field') defaultValue = this.props.fields[0] || null;
		if(value === 'Value') defaultValue = 10;
		if(value === 'Condition'){
			defConditionValue = 10
		}
		
		this.setState({
			valueType: value, 
			value: defaultValue,
			conditionValue: defConditionValue,
			conditionValueType: defConditionValueType
		});
		
		this.props.onChange({
			valueType: value,
			value: value === 'Condition' ? this.state.conditionList : defaultValue
		});
		
	};
	
	handleFieldValueChange = (value) => { 
		this.setState({value: value}); 
		this.props.onChange({
			valueType: 'Field',
			value: value
		});
	}
	
	handleConditionValueTypeChange = (value) => { 
	
		let defaultValue = null;
		
		if(value === 'Field') defaultValue = this.props.fields[0] || null;
		if(value === 'Value') defaultValue = 10;
		
		this.setState({conditionValueType: value, conditionValue: defaultValue}) 
	};
	
	onQueryBuilderChange = (tree) => {
		this.setState({value: tree});
	}
	
	addCondition = () => {
		this.setState({
			conditionList: [ 
				...this.state.conditionList,
				{ 
					tree: this.state.value, 
					value: this.state.conditionValue,
					valueType: this.state.conditionValueType
				}
			]
		});
		
		this.props.onChange({
			valueType: 'Condition',
			value: [ 
				...this.state.conditionList,
				{ 
					tree: this.state.value, 
					value: this.state.conditionValue,
					valueType: this.state.conditionValueType
				}
			]
		});
	}
	
	handleConditionValueChange = (e) => this.setState({conditionValue: e.target.value });
	
	handleConditionFieldValueChange = (value) => this.setState({conditionValue: value});
	
	deleteConditionRule = (index) => {
		let conditionList = this.state.conditionList;
		conditionList.splice(index, 1);
		this.setState({conditionList: conditionList});
		
		this.props.onChange({
			valueType: 'Condition',
			value: conditionList
		});
		
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
	
	handleInputValueChange = (e) => {
		this.props.onChange({
			value: e.target.value,
			valueType: 'Value'
		});
	}
				
	render(){
		
		const valueTypeHelpContent = (
			<div>
				The value can be : Value, Field, or Condition. 
				<ul>
					<li>The <b>Value</b> type requires you to input a value. </li>
					<li>The <b>Field</b> type picks the value from a column in the data file. </li>
					<li>The <b>Condition</b> type allows you to specify a value depending on a series of conditions. </li>
				</ul>

			</div>
		);
		
		//Configure query builder
		this.config = {
			...config,
			
			fields: this.props.fields.reduce((result1, item1, index1, array1) => {
				
				result1[item1] = {
					label: item1,
					type: 'text',
					defaultOperator: 'equal',
					operators: [
						"equal",
						"not_equal",
						"less",
						"less_or_equal",
						"greater",
						"greater_or_equal",
						"between",
						"not_between",
						"is_empty",
						"is_not_empty",
						"starts_with",
						"ends_with",
						"regexp"
					]
				};

				return result1;
			}, {}),
			
		};

		
		let ValueField = (
			<Input 
				disabled={this.props.disabled}
				placeholder="Value" 
				defaultValue={this.state.value} 
				onChange={this.handleInputValueChange}
				style={{width: '50%'}}
			/>
		);
		
		if( this.state.valueType === 'Field'){
			ValueField = (
				<Select 
					disabled={this.props.disabled}
					defaultValue={this.state.value} 
					style={{ width: 250 }} 
					onChange={this.handleFieldValueChange}>
				  {this.props.fields.map(v => (
					<Option value={v} key={v}>{v}</Option>
				  ))}
				</Select>
			);
		}
		
		if( this.state.valueType === 'Condition'){
			ValueField = (
			<Fragment>
				<div className="row">
					<div className="col-12">
					<ol>
				{
					this.state.conditionList.map((cond, tIdx) => (
						<li key={tIdx}>
							<Icon icon="remove" onClick={() => this.deleteConditionRule(tIdx)} /> &nbsp;
							Radius = <strong/>{cond.value}<strong/> IF {QbUtils.queryString(cond.tree, this.config)} 
						</li>
					))
				}
					</ol>
					
					{this.state.conditionList.length > 0 ? (<div className="mb-2" style={{borderBottom: "1px solid #cccccc"}}></div>) : ""}
					
					</div>
				</div>
			
				<div className="row">
					<div className="col-8">
						<Query 
							disabled={this.props.disabled}
						  {...this.config} 
						  //you can pass object here, see treeJSON at onChange
						  //value=transit.fromJSON(treeJSON)
						  get_children={this.getChildren}
						  onChange={this.onQueryBuilderChange}
						></Query>
					</div>
					<div className="col-4" style={{borderLeft: "1px solid #cccccc"}}>
						<div className="mb-1">
							<Select 
								disabled={this.props.disabled}
								size="small"
								defaultValue={this.state.conditionValueType} 
								style={{ width: 120 }} 
								onChange={this.handleConditionValueTypeChange}>
							  {["Value", "Field"].map(v => (
								<Option value={v} key={v}>{v}</Option>
							  ))}
							</Select>
						</div>
						{this.state.conditionValueType === 'Value' ? (
							<Input 
								disabled={this.props.disabled}
								placeholder="Value" 
								defaultValue={this.state.conditionValue}
								size="small"
								onChange={this.handleConditionValueChange}
							/>
						) : (
							<Select 
								disabled={this.props.disabled}
								size="small"
								defaultValue={this.state.conditionValue} 
								style={{ width: 250 }} 
								onChange={this.handleConditionFieldValueChange}>
							  {this.props.fields.map(v => (
								<Option value={v} key={v}>{v}</Option>
							  ))}
							</Select>
						)}
						
						
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						<AntdButton 
							size="small" 
							onClick={this.addCondition} 
							disabled={this.props.disabled}>Add condition</AntdButton>
					</div>
				</div>
			</Fragment>
			);
		}
		
		return (
			<div className="col-12">
				<div className="mb-2">
					<Select 
						disabled={this.props.disabled}
						defaultValue={this.state.valueType} 
						style={{ width: 120 }} 
						onChange={this.handleValueTypeChange}>
					  {VALUE_TYPES.map(v => (
						<Option value={v} key={v}>{v}</Option>
					  ))}
					</Select> &nbsp;
					<AntPopover 
						content={valueTypeHelpContent}
						title={"? Value Type"}
					>
						<Icon icon="info-sign" />
					</AntPopover>
				</div>
				<div className="mb-2">
					{ValueField}
				</div>

			</div>
		);
	}
}


class ColorValue extends React.Component{
	constructor(props){
		super(props);
		
		this.defaultColor = '#3281a8';
		
		this.state = {
			valueType: 'Value',
			value: this.defaultColor,
			
			//Condition
			conditionLabel: "",
			conditionValueType: 'Value',
			conditionValue: this.defaultColor,
			conditionList: [
			
			]
		};
		
	}
	
	handleValueTypeChange = (value) => { 
		let defaultValue = null;
		let defConditionValue = this.defaultColor;
		let defConditionValueType = 'Value';
		
		if(value === 'Field') defaultValue = this.props.fields[0] || null;
		if(value === 'Value') defaultValue = this.defaultColor;
		if(value === 'Condition'){
			defConditionValue = this.defaultColor;
		}
		
		this.setState({
			valueType: value, 
			value: defaultValue,
			conditionValue: defConditionValue,
			conditionValueType: defConditionValueType
		});
		
		this.props.onChange({
			valueType: value,
			value: value === 'Condition' ? this.state.conditionList : defaultValue
		});
		
	};
	
	handleFieldValueChange = (value) => { 
		this.setState({value: value}); 
		this.props.onChange({
			valueType: 'Field',
			value: value
		});
	}
	
	handleConditionValueTypeChange = (value) => { 
	
		let defaultValue = null;
		
		if(value === 'Field') defaultValue = this.props.fields[0] || null;
		if(value === 'Value') defaultValue = this.defaultColor;
		
		this.setState({conditionValueType: value, conditionValue: defaultValue}) 
	};
	
	onQueryBuilderChange = (tree) => {
		this.setState({value: tree});
	}
	
	addCondition = () => {
		this.setState({
			conditionList: [ 
				...this.state.conditionList,
				{ 
					tree: this.state.value, 
					value: this.state.conditionValue,
					valueType: this.state.conditionValueType,
					label: this.state.conditionLabel
				}
			]
		});
		
		this.props.onChange({
			valueType: 'Condition',
			value: [ 
				...this.state.conditionList,
				{ 
					tree: this.state.value, 
					value: this.state.conditionValue,
					valueType: this.state.conditionValueType,
					label: this.state.conditionLabel
				}
			]
		});
	}
	
	handleConditionValueChange = (e) => this.setState({conditionValue: e.target.value });
	
	handleLabelChange = (e) => this.setState({conditionLabel: e.target.value });
	
	handleConditionFieldValueChange = (value) => this.setState({conditionValue: value});
	
	deleteConditionRule = (index) => {
		let conditionList = this.state.conditionList;
		conditionList.splice(index, 1);
		this.setState({conditionList: conditionList});
		
		this.props.onChange({
			valueType: 'Condition',
			value: conditionList
		});
		
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
	
	handleInputValueChange = (e) => {
		this.setState({value: e.target.value});
		this.props.onChange({
			value: e.target.value,
			valueType: 'Value'
		});
	}
				
	render(){
		const valueTypeHelpContent = (
			<div>
				The value can be : Value, Field, or Condition. 
				<ul>
					<li>The <b>Value</b> type requires you to input a value. </li>
					<li>The <b>Field</b> type picks the value from a column in the data file. </li>
					<li>The <b>Condition</b> type allows you to specify a value depending on a series of conditions. </li>
				</ul>

			</div>
		);
		
		//configure query builder 
		this.config = {
			...config,
			
			fields: this.props.fields.reduce((result1, item1, index1, array1) => {
				
				result1[item1] = {
					label: item1,
					type: 'text',
					defaultOperator: 'equal',
					operators: [
						"equal",
						"not_equal",
						"less",
						"less_or_equal",
						"greater",
						"greater_or_equal",
						"between",
						"not_between",
						"is_empty",
						"is_not_empty",
						"starts_with",
						"ends_with",
						"regexp"
					]
				};

				return result1;
			}, {}),
			
		};
		
		let ValueField = (
			<input 
				value={this.state.value} 
				type="color" 
				onChange={this.handleInputValueChange}
				disabled={this.props.disabled}/>
		);
		
		if( this.state.valueType === 'Field'){
			ValueField = (
				<Select 
					disabled={this.props.disabled}
					defaultValue={this.state.value} 
					style={{ width: 250 }} 
					onChange={this.handleFieldValueChange}>
				  {this.props.fields.map(v => (
					<Option value={v} key={v}>{v}</Option>
				  ))}
				</Select>
			);
		}
		
		if( this.state.valueType === 'Condition'){
			ValueField = (
			<Fragment>
				<div className="row">
					<div className="col-12">
					<ol>
				{
					this.state.conditionList.map((cond, tIdx) => (
						<li key={tIdx}>
							<Icon icon="remove" onClick={() => this.deleteConditionRule(tIdx)} /> &nbsp;
							Label = {cond.label} | 
							Color = <Icon icon="symbol-square" style={{color: cond.value}}/>({cond.value}) |
							IF {QbUtils.queryString(cond.tree, this.config)} 
						</li>
					))
				}
					</ol>
					
					{this.state.conditionList.length > 0 ? (<div className="mb-2" style={{borderBottom: "1px solid #cccccc"}}></div>) : ""}
					
					</div>
				</div>
			
				<div className="row">
					<div className="col-6">
						<Query 
							disabled={this.props.disabled}
						  {...this.config} 
						  //you can pass object here, see treeJSON at onChange
						  //value=transit.fromJSON(treeJSON)
						  get_children={this.getChildren}
						  onChange={this.onQueryBuilderChange}
						></Query>
					</div>
					<div className="col-4" style={{borderLeft: "1px solid #cccccc"}}>
						<div className="mb-1">
							<Select 
								disabled={this.props.disabled}
								size="small"
								defaultValue={this.state.conditionValueType} 
								style={{ width: 120 }} 
								onChange={this.handleConditionValueTypeChange}>
							  {["Value", "Field"].map(v => (
								<Option value={v} key={v}>{v}</Option>
							  ))}
							</Select>
						</div>
						{this.state.conditionValueType === 'Value' ? (
							<input 
								disabled={this.props.disabled}
								value={this.state.conditionValue}
								size="small"
								onChange={this.handleConditionValueChange}
								type="color"
							/>
						) : (
							<Select 
								disabled={this.props.disabled}
								size="small"
								defaultValue={this.state.conditionValue} 
								style={{ width: 250 }} 
								onChange={this.handleConditionFieldValueChange}>
							  {this.props.fields.map(v => (
								<Option value={v} key={v}>{v}</Option>
							  ))}
							</Select>
						)}
						
						
					</div>
					<div className="col-2" style={{borderLeft: "1px solid #cccccc"}}>
						<Input 
							placeholder="Label" 
							defaultValue={this.state.label} 
							onChange={this.handleLabelChange}
							disabled={this.props.disabled}
						/>
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						<AntdButton 
							size="small" 
							onClick={this.addCondition}
							disabled={this.props.disabled}
						>Add condition</AntdButton>
					</div>
				</div>
			</Fragment>
			);
		}
		
		return (
			<div className="col-12">
				<div className="mb-2">
					<Select 
						disabled={this.props.disabled}
						defaultValue={this.state.valueType} 
						style={{ width: 120 }} 
						onChange={this.handleValueTypeChange}>
					  {VALUE_TYPES.map(v => (
						<Option value={v} key={v}>{v}</Option>
					  ))}
					</Select> &nbsp;

					<AntPopover 
						content={valueTypeHelpContent}
						title={"? Value Type"}
					>
						<Icon icon="info-sign" />
					</AntPopover>
					
				</div>
				<div className="mb-2">
					{ValueField}
				</div>

			</div>
		);
	}
}



class KMLGenerator extends React.Component {
     static icon = "globe";
     static label = "KML Generator"

	constructor(props){
		super(props);
		
		this.state = {
			dataFile: this.props.config.dataFile || "Data file...",
			
			//valueType=Value|Field
			// value is the name of the folder
			folder: { value:'Cells', valueType: 'Value'}, 
			
			//Location
			latitudeField: this.props.headers[0] || null,
			longitudeField: this.props.headers[0] || null,
			azimuthField: this.props.headers[0] || null,
			cellLabelField: this.props.headers[0] || null,
			descField: this.props.headers[0] || null,
			
			legendLabel: 'Theme1',
			legendColor: DEFAULT_COLOR,
			legendOptions: [], //{color:..., label:...}
			
			//description fields
			descFields: [],
			
			folders: [
				//Remove initial Cells group -- since @0.4.5
				//{
				//	value: "Cells",
				//	valueType: "Value", //Value or Field
				//}
			],
			
			radius: { value: 10, valueType: 'Value'},
			height: { value: 10, valueType: 'Value'},
			color: { value: DEFAULT_COLOR, valueType: 'Value'},
			
			folderType: 'Value',
			
			processing: false,
			notice: null, //{type:info|success|error|warning, message: ...}
		};
		
		this.generateKMLListener = null;
	}
	
	handleFolderTypeChange = (e) => { this.setState({folderType: e.target.value}); }
	
	addDescField = () => this.setState({descFields: [...this.state.descFields, this.state.descField]})
	
	removeDescField = (index) => {
		let descFields = [...this.state.descFields];
		descFields.splice(index, 1);
		this.setState({descFields: descFields});
	}
	
	handleDescFieldChange = (val) => this.setState({descField: val});
	
	onDataFileChange = (e) => {
		if (!fs.existsSync(e.target.files[0].path)) {
			this.setState({errorMessage: `${e.target.files[0].path} does not exist`})
			return;
		}
		
		const dataFile  =  e.target.files[0].path;
		
		this.setState({
			dataFile: dataFile
		});
		
		this.props.dispatch(kmlExtractingHeaders(dataFile));
		
		setTimeout(() => {
			this.props.dispatch(kmlGetDataHeaders(dataFile));
		}, 1000);
		
		
	}
	
	showDataFile = () => {
		if (!fs.existsSync(this.state.dataFile)) {
			this.setState({errorMessage: `${this.state.dataFile} does not exist`})
			return;
		}
		
		shell.openItem(this.state.dataFile);
	}
	
	removeFolder = (index) => {
		let folders = this.state.folders;
		folders.splice(index, 1);
		this.setState({folders: folders});
	}
	
	addFolder = () => {
		this.setState({
			folders: [...this.state.folders, this.state.folder]
		});
	}
	
	handleFolderChange = (value) => this.setState({folder: value});
	
	handleLatitudeChange = (value) => this.setState({latitudeField: value});
	
	handleLongitudeChange = (value) => this.setState({longitudeField: value});
	
	handleAzimuthChange = (value) => this.setState({azimuthField: value});
	
	handleCellLabelChange = (value) => this.setState({cellLabelField: value});
	
	handleHeightChange = (value) => this.setState({height: value});
	
	handleRadiusChange = (value) => this.setState({radius: value});
	
	handleColorChange = (value) => this.setState({color: value});
	
	handleLegendLabelChange = (e) => this.setState({legendLabel: e.target.value});
	
	handleLegendColorChange = (e) => this.setState({legendColor: e.target.value});
	
	deleteLegendKey = (index) => {
		let legendOptions = this.state.legendOptions;
		legendOptions.splice(index, 1);
		this.setState({legendOptions: legendOptions});	
	}

	
	addLegendKey = () => {
		
		this.setState({
			legendOptions: [
				...this.state.legendOptions,
				{
					color: this.state.legendColor,
					label: this.state.legendLabel
				}
			]
		});
		
	}
		
	generateKML = () => {
		let payload = {
			dataFile: this.props.config.dataFile,
			latitudeField: this.state.latitudeField,
			longitudeField: this.state.longitudeField,
			azimuthField: this.state.azimuthField,
			cellLabelField: this.state.cellLabelField,
			folders: this.state.folders,
			radius: this.state.radius,
			height: this.state.height,
			color: this.state.color,
			descFields: this.state.descFields,
			legendOptions: this.state.legendOptions
		}
		
		//Set processing to true 
		this.setState({processing: true });
		
		ipcRenderer.send('parse-cm-request', 'generate_kml', JSON.stringify(payload));
		
		this.generateKMLListener = (event, task, args) => {
			const obj = JSON.parse(args)
			if(task !== 'generate_kml') return;
			
			//error
			if(obj.status === 'error' && task === 'generate_kml' ){
				this.setState({
						notice: {type: 'danger', message: obj.message},
						processing: false
						});
				ipcRenderer.removeListener("parse-cm-request", this.generateKMLListener);
			}
			
			//info
			if(obj.status === 'info' && task === 'generate_kml' ){
				this.setNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'generate_kml' ){
				this.setState({
						notice: {
							type: 'success', 
							message: 'KMZ file generated at ' + obj.message
							},
						processing: false
						});
				const kmlFile = obj.message;
				shell.showItemInFolder(kmlFile);
				ipcRenderer.removeListener("parse-cm-request", this.generateKMLListener);
			}
			
		}

		ipcRenderer.on('parse-cm-request', this.generateKMLListener);	
	}
	
	dismissNotice = () => {
		this.setState({notice: null});
	}

	//faGlobe
	render(){
		const dataFile = this.props.config.dataFile ;
		const folderHelpContent = (
			<div>
				Folders section allows you to group related data together for filtering purposes.
			</div>
		);
		const requiredHelpContent = (
			<div>
				Latitude, Longitude, Azimuth, and Label are requried. The label is used for the popup info dialog.
			</div>
		);
		
		const descriptionFieldsHelpContent = (
			<div>
				Specify the fields to show in the details popup dialog when each cell is clicked.
			</div>
		);

		const legendHelpContent = (
			<div>
				Legend for the color themes
			</div>
		);
		
		const radiusHelpContent = (
			<div>
				Specifiy the coverage radius in this section. The radius value can be  <br/>
				manaully in-put, selected from a column in the data file or can depend a series  of conditions
			</div>
		);
		
		const colorHelpContent = (
			<div>
				Pick or provide the color to use for the cell. If the color is manually <br />
				provided, a <b>hexadecimal</b> color value of the form "<code>#FFFFFF</code>" is <br />
				expected.
			</div>
		);
		
		
		//
		
		const processing = this.state.processing || this.props.processing;
		
		let notice = null;
		if(this.state.notice !== null ){ 
			notice = (<div className={`alert alert-${this.state.notice.type} p-2`} role="alert">{this.state.notice.message}
					<button type="button" className="close"  aria-label="Close" onClick={this.dismissNotice}>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>)
		}
		
		let dataFileEllipsis = dataFile === 'Data file...' ? "" : "file-text-dir-rtl";

		return (
			<div>
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend"><FontAwesomeIcon icon="globe"/> KML Generator</legend>

					{ processing ? (<ProgressBar intent={Intent.PRIMARY} className="mt-1  mb-2"/>) : ""}

					{notice}
					
                  <div className="card-body">
						<form>

						  <div className="form-group row">
							<div className="col-sm-8">
							  <FileInput className={"form-control " + dataFileEllipsis} text={dataFile} onInputChange={this.onDataFileChange}  disabled={this.state.processing}/>
							</div>
							<div className="col-sm-2">
								<Button icon="folder-open" text="" minimal={true} onClick={(e) => this.showDataFile()} disabled={this.state.processing}/>
							</div>
						  </div>

						  {/*Layer settings*/}
						  <div>
						  
								<div>
									<h6 className="horizontal-line">
										<span className="horizontal-line-text">
											Folders	&nbsp;
											<AntPopover 
												content={folderHelpContent}
												title={"? Folders"}
											>
												<Icon icon="info-sign" />
											</AntPopover> 
											<Icon icon="chevron-right" />								
										</span>
									</h6>
									<div>
										<div className="mb-2">
											<div className="mb-1">

											
											<ul style={{marginLeft: "0px", paddingLeft: "0px"}}>
											{this.state.folders.map((v, fi) => (
												<Fragment key={fi}>
													<li style={{listStyleType: "none"}}>
														{[...Array(fi*7)].map((e, ai) => <span className="busterCards" key={ai}>&nbsp;</span>)}
														{"|---"}
														<span><Icon icon="folder-close"/> {v.value}</span>
														<Icon icon="cross" onClick={() => this.removeFolder(fi)} /> 
													</li>
												</Fragment>
											))}		
											</ul>
											</div>
											
											<Folder 
												fields={this.props.headers} 
												defaultValue={this.state.folder} 
												onChange={this.handleFolderChange}
												disabled={processing}
											/>
											<AntdButton onClick={this.addFolder} disabled={processing}>Add folder</AntdButton>
										</div>
										
									</div>
								</div>
							  
							  <div>
								<h6 className="horizontal-line">
									<span className="horizontal-line-text">
										Required &nbsp;
										<AntPopover 
											content={requiredHelpContent}
											title={"? Required"}
										>
											<Icon icon="info-sign" />
										</AntPopover>
										<Icon icon="chevron-right" />
									</span>
								</h6>
								
							  </div>
							<div className="row">
								<div className="col-6">
									<div className="form-group row">
										<label htmlFor="select_vendor" className="col-sm-2 col-form-label">Latitude</label>
										<div className="col-sm-10">
											<Select 
												defaultValue={this.state.latitudeField} 
												style={{ width: 250 }} 
												onChange={this.handleLatitudeChange}
												 disabled={processing} 
												>
											  {this.props.headers.map(v => (
												<Option value={v} key={v}>{v}</Option>
											  ))}
											</Select>
										</div>
									</div>
								</div>
								<div className="col-6">
									<div className="form-group row">
										<label htmlFor="select_vendor" className="col-sm-2 col-form-label">Longitiude</label>
										<div className="col-sm-10">
											<Select 
												defaultValue={this.state.longitudeField} 
												style={{ width: 250 }} 
												onChange={this.handleLongitudeChange}
												 disabled={processing} 
												>
											  {this.props.headers.map(v => (
												<Option value={v} key={v}>{v}</Option>
											  ))}
											</Select>
										</div>
									</div>
								</div>
						  </div>
						  
							<div className="row">
								<div className="col-6">
									<div className="form-group row">
										<label htmlFor="select_azimuth" className="col-sm-2 col-form-label">Azimuth</label>
										<div className="col-sm-10">
											<Select 
												defaultValue={this.state.azimuthField} 
												style={{ width: 250 }} 
												onChange={this.handleAzimuthChange}
												 disabled={processing} 
												>
											  {this.props.headers.map(v => (
												<Option value={v} key={v}>{v}</Option>
											  ))}
											</Select>
										</div>
									</div>
								</div>
								<div className="col-6">
									<div className="form-group row">
										<label htmlFor="select_label" className="col-sm-2 col-form-label">Label</label>
										<div className="col-sm-10">
											<Select 
												defaultValue={this.state.cellLabelField} 
												style={{ width: 250 }} 
												onChange={this.handleCellLabelChange}
												 disabled={processing} 
												>
											  {this.props.headers.map(v => (
												<Option value={v} key={v}>{v}</Option>
											  ))}
											</Select>
										</div>
									</div>
								</div>
						  </div>
						  
						  <div>
								<h6 className="horizontal-line">
									<span className="horizontal-line-text">
										Height <Icon icon="chevron-right" />
									</span>
								</h6>
						  </div>

							<div className=" form-group row">
									<HeightValue 
										fields={this.props.headers}
										onChange={this.handleHeightChange}
										disabled={processing}
									/>
							</div>
						  
						  <div>
								<h6 className="horizontal-line">
									<span className="horizontal-line-text">
										Radius &nbsp;
										<AntPopover 
											content={radiusHelpContent}
											title={"? Radius"}
										>
											<Icon icon="info-sign" />
										</AntPopover>
										<Icon icon="chevron-right" />
									</span>
								</h6>
						  </div>
							  
							<div className=" form-group row">
								<RadiusValue 
									fields={this.props.headers}
									onChange={this.handleRadiusChange}
									disabled={processing}
								/>
							</div>
							
						  
							<div>
								<h6 className="horizontal-line">
									<span className="horizontal-line-text">
										
										Colors &nbsp;
										<AntPopover 
											content={colorHelpContent}
											title={"? Color"}
										>
											<Icon icon="info-sign" />
										</AntPopover>
										<Icon icon="chevron-right" />

									</span>
								</h6>
							</div>
						  
							<div className=" form-group row">
								<ColorValue 
									fields={this.props.headers}
									onChange={this.handleColorChange}
									disabled={processing}
								/>
							</div>
							
							<div>
								<h6 className="horizontal-line">
									<span className="horizontal-line-text">
										
										Legend &nbsp;
										<AntPopover 
											content={legendHelpContent}
											title={"? Legend"}
										>
											<Icon icon="info-sign" />
										</AntPopover>
										<Icon icon="chevron-right" />

									</span>
								</h6>
							</div>
							
						  
						  <div className=" form-group row">
							<div className="col-12">
								
								<ul style={{listStyleType: "none", paddingLeft:"1px"}}>
									{this.state.legendOptions.map((v, idx) => (
										<li key={idx}> 
											<Icon icon="remove" onClick={() => this.deleteLegendKey(idx)}/>
											<Icon icon="symbol-square" style={{color: v.color}} iconSize={20}/> 
											{v.label}
										</li>
									))}
								</ul>
				
								<table width="500px">
									<tbody>
									<tr>
										<td>
											<Input 
												type="color" 
												style={{width: "50px"}}
												defaultValue={this.state.legendColor} 
												onChange={this.handleLegendColorChange}
											/>
										</td>
										<td>								
											<Input placeholder="Value" 
												defaultValue={this.state.legendLabel} 
												onChange={this.handleLegendLabelChange}
												style={{width: '400px'}}
												disabled={processing}
											/>
										</td>
										<td>
											<AntdButton 
												onClick={this.addLegendKey} 
												disabled={processing}
											>
												Add color key
											</AntdButton>
										</td>
									</tr>
									</tbody>
								</table>
							

							</div>
						  </div>
						  
						  <div>
								<h6 className="horizontal-line">
									<span className="horizontal-line-text">
										Description fields &nbsp;
										<AntPopover 
											content={descriptionFieldsHelpContent}
											title={"? Description fields"}
										>
											<Icon icon="info-sign" />
										</AntPopover>
										<Icon icon="chevron-right" />
										
									</span>
								</h6>
						  </div>

						  
							<div className=" form-group row">
								<div className="col-12">
								<div className="mb-2">
									<Select 
										className="mr-2"
										defaultValue={this.state.descField} 
										style={{ width: 250 }} 
										onChange={this.handleDescFieldChange}
										 disabled={processing} 
										>
									  {this.props.headers.filter(v => this.state.descFields.indexOf(v) < 0).map(v => (
										<Option value={v} key={v}>{v}</Option>
									  ))}
									</Select>
									<AntdButton onClick={this.addDescField} disabled={processing}>Add field</AntdButton>
								</div>
								
								<div>
									<ol>
									{this.state.descFields.map((v,i) => (
										<li key={i}><Icon icon="remove" onClick={() => this.removeDescField(i)}/> {v}</li>
									))}
									</ol>
								</div>
								</div>
							</div>
						  
						  
					</div>

						<Button 
							text="Generate KMZ" 
							intent={Intent.PRIMARY}
							onClick={this.generateKML}
							disabled={processing}
						/>
						  
						</form>
					</div>	
				</fieldset>
			</div>
		);
		
	}
	
}


function mapStateToProps(state, ownProps){
    return {
        headers: state.kml.headers,
		config: state.kml.config,
		processing: state.kml.processing
    };
}

export default connect(mapStateToProps)(KMLGenerator);
