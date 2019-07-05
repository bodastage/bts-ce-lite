import React from 'react';
import { connect } from 'react-redux';
import { Intent, Spinner } from "@blueprintjs/core";
import { getReportInfo } from './reports-actions';
import TableReport from './TableReport';
import GraphReport from './GraphReport';

//const GraphReport = <div/>
//const TableReport = <div />
/**
 * This component display the reports
 * 
 */
class ReportContainer extends React.Component{
    static icon = "table";
    static label = "";
    
    constructor(props){
        super(props);
    }
    
    componentDidMount() {
        
        //If there are no fields then there is no info about the report downloaded yet
        if(this.props.reportInfo === null ){
            this.props.dispatch(getReportInfo(this.props.options.reportId));
        }  
    }
	
    render(){
        
		console.log("this.props.reportInfo:", this.props.reportInfo);
		
        //Show spinner as we wait for data
        if( this.props.reportInfo === null ){
            return <Spinner size={Spinner.SIZE_LARGE} className="mt-5"/>
        }
        console.log("this.props.reportInfo.options:", this.props.reportInfo.options);
		
        //Show table tabular data
        //If options are null, {},
        if( this.props.reportInfo.options === null || typeof this.props.reportInfo.options === 'undefined' ) return <TableReport options={this.props.options}/> 
		if( Object.keys(this.props.reportInfo.options).length === 0) return <TableReport options={this.props.options}/> 

		
        const reportOptions = JSON.parse(this.props.reportInfo.options)
        if(reportOptions.type === 'Graph'){
            return <GraphReport options={this.props.options}/>
        }
		
        //Table report is the default
        return <TableReport options={this.props.options} reportInfo={this.props.reportInfo}/>
		
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

export default connect(mapStateToProps)(ReportContainer);