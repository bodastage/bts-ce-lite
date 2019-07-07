import React from 'react';
import { connect } from 'react-redux';
import { Intent, Spinner, Icon } from "@blueprintjs/core";
import { getReportInfo } from './reports-actions';
import TableReport from './TableReport';
import GraphReport from './GraphReport';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
		
        //Show spinner as we wait for data
        if( this.props.reportInfo === null ){
            return (
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend">Loading...</legend>
						<Spinner size={Spinner.SIZE_LARGE} className="mt-5"/>
				</fieldset>
			);
        }
		
		//if the report options are not set or are undefined
		if( this.props.reportInfo.options === null || typeof this.props.reportInfo.options === 'undefined' ){
            return (
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend">Loading...</legend>
						<Spinner size={Spinner.SIZE_LARGE} className="mt-5"/>
				</fieldset>
			);
			
		}
		
		//@TODO: Refactor code and be consistenet. return options as object in action code 
        let reportOptions = this.props.reportInfo.options
		if (typeof  reportOptions === 'string') reportOptions =  JSON.parse(this.props.reportInfo.options)
		
        if(reportOptions.type === 'Graph'){
            return (
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend"><Icon icon="timeline-bar-chart"/> {this.props.reportInfo.name}</legend>
					<GraphReport options={this.props.options}/>
				</fieldset>
			);
        }
		
        //Table report is the default
        return (
			<fieldset className="col-md-12 fieldset">    	
				<legend className="legend"><FontAwesomeIcon icon="table"/> {this.props.options.title}</legend>
				<TableReport options={this.props.options} reportInfo={this.props.reportInfo}/>
			</fieldset>
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

export default connect(mapStateToProps)(ReportContainer);