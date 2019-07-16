import React from 'react';
import { connect } from 'react-redux';
import { Spinner } from "@blueprintjs/core";
import { getReportInfo } from './reports-actions';
import TableReport from './TableReport';
import GraphReport from './GraphReport';
import CompositeReport from './CompositeReport';


//Exact copy of the  ReportContainer component without the fieldsets 
class CompositeReportContainer extends React.Component{
    static icon = "table";
    static label = "";
    
    componentDidMount() {
        
        //If there are no fields then there is no info about the report downloaded yet
        if(this.props.reportInfo === null ){
            this.props.dispatch(getReportInfo(this.props.options.reportId));
        }  
    }
	
	
    render(){

        //Show spinner as we wait for data
        if( this.props.reportInfo === null ){
            return (
				<Spinner size={Spinner.SIZE_LARGE} className="mt-5"/>
			);
        }
		
		//if the report options are not set or are undefined
		if( this.props.reportInfo.options === null || typeof this.props.reportInfo.options === 'undefined' ){
            return (
				<Spinner size={Spinner.SIZE_LARGE} className="mt-5"/>
			);
			
		}

		
		//@TODO: Refactor code and be consistenet. return options as object in action code 
        let reportOptions = this.props.reportInfo.options
		if (typeof  reportOptions === 'string') reportOptions =  JSON.parse(this.props.reportInfo.options)
		
        if(reportOptions.type === 'Graph'){
            return (
				<GraphReport options={this.props.options}/>
			);
        }
		
        if(reportOptions.type === 'Composite'){
            return (
				<CompositeReport options={this.props.options} reportInfo={this.props.reportInfo}/>
			);
        }
		
		
        //Table report is the default
        return (
			<TableReport options={this.props.options} reportInfo={this.props.reportInfo}/>
		);
		
    }
}

function mapStateToProps(state, ownProps){
    
    if ( typeof state.reports.reportsInfo[ownProps.options.reportId] === 'undefined'){
        return {
            reportInfo: null,
        };
    }
    
    return {
            reportInfo: state.reports.reportsInfo[ownProps.options.reportId]
    };
}

export default connect(mapStateToProps)(CompositeReportContainer);