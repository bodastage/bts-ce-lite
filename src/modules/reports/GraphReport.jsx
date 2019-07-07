import React from 'react';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import { getGraphData } from './reports-actions';
import { SizeMe } from 'react-sizeme'
import { Icon, ButtonGroup, Button, Intent, Toaster, Callout } from "@blueprintjs/core";

class GraphReport extends React.Component{
    static icon = "table";
    static label = "";
    
    constructor(props){
        super(props);
        
        this.state = {
            width: window.innerWidth - 500
        }
        
        this.updatePlotData.bind(this)
		this.refreshData = this.refreshData.bind(this)

        //Plot data and options/settings
        this.plotData = []
        this.layoutOptions = {width: this.state.width, height: null, autosize: false, title: null}
		
		this.toaster = new Toaster();

    }       
    
    componentDidMount(){
        this.props.dispatch(getGraphData(this.props.options.reportId));
    }
    
    /**
     * Create toask reference
     */
    refHandlers = {
        toaster: (ref) => (this.toaster = ref),
    };
	
	/**
	* Refresh graph data
	*/
	refreshData(){
		this.props.dispatch(getGraphData(this.props.options.reportId));
		
		
        this.toaster.show({
			icon: "info-sign",
			intent: Intent.INFO,
			message: "Refreshing report...",
        });
	}
    /**
     * Update plot data with the values from the query and any new options
     * 
     * @param {type} newOptions
     * @returns
     */
    updatePlotData(newOptions){

        //Remove empty slots
        newOptions = newOptions.filter((v) => v!==undefined )
        for(let i in newOptions){
            
            if( newOptions[i].type === 'bar'){
                let xField = newOptions[i].xField;
                let yField = newOptions[i].yField;
                newOptions[i].x = this.props.reportData.data.map((entry, idx) => entry[xField]);
                newOptions[i].y = this.props.reportData.data.map((entry, idx) => entry[yField]);
                newOptions[i].name = yField;
            }

            if( newOptions[i].type === 'scatter'){
                let xField = newOptions[i].xField;
                let yField = newOptions[i].yField;
                newOptions[i].x = this.props.reportData.data.map((entry, idx) => entry[xField]);
                newOptions[i].y = this.props.reportData.data.map((entry, idx) => entry[yField]);
                newOptions[i].name = yField;
            }
            
            if( newOptions[i].type === 'pie'){
                let labelsField = newOptions[i].labelsField;
                let valuesField = newOptions[i].valuesField;
                newOptions[i].labels = this.props.reportData.data.map((entry, idx) => entry[labelsField]);
                newOptions[i].values = this.props.reportData.data.map((entry, idx) => entry[valuesField]);
            }
        }
        
        return  newOptions;
    }
    
    render(){
        let plotTitle = 'Loading...'
        if(this.props.reportInfo !== null){
            let plotOptions = this.props.reportInfo.options;
            this.plotData = this.updatePlotData(plotOptions.data)
            this.layoutOptions = plotOptions.layout
            plotTitle = this.props.reportInfo.name
        }
        
		//If there is an error with the query
        if( this.props.requestError !== null ){
            return (
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend"><Icon icon="timeline-bar-chart"/> {plotTitle}
						<a href="/#"><Icon icon="refresh" onClick={this.refreshData} className="float-right"></Icon></a>
					</legend>
                    <Callout intent={Intent.DANGER}> {this.props.requestError}</Callout>
					<Toaster {...this.state} ref={this.refHandlers.toaster} />
				</fieldset>		
				);
        }
		
		
        return (
		<fieldset className="col-md-12 fieldset">    	
			<legend className="legend"><Icon icon="timeline-bar-chart"/> {plotTitle}
					<a href="/#"><Icon icon="refresh" onClick={this.refreshData} className="float-right"></Icon></a>
			</legend>			
				<div style={{width:"100%"}}>
					<SizeMe>
						{({ size }) => <Plot
							data={this.plotData}
							layout={this.layoutOptions}
							config={{displaylogo:false}}
							responsive={true}
							useResizeHandler={true}
						/>}

					</SizeMe>
				</div>
			<Toaster {...this.state} ref={this.refHandlers.toaster} />
		</fieldset>	
		);
    }
}

function mapStateToProps(state, ownProps){
    
    if ( typeof state.reports.reportsdata[ownProps.options.reportId] === 'undefined'){
        return {
            reportInfo: null,
            reportData: {},
            requesting: false,
            requestError:  null,
        };
    }
	
	//Error 
	if(state.reports.reportsdata[ownProps.options.reportId].requestError !== null){
		return {
            reportInfo: null,
            reportData: {},
            requesting: false,
			requestError: state.reports.reportsdata[ownProps.options.reportId].requestError,
		}
	}
	
	//If there is no data yet 
	if(typeof state.reports.reportsdata[ownProps.options.reportId].data === 'undefined' ){
        return {
            reportInfo: null,
            reportData: {},
            requesting: false,
            requestError:  null,
        };
	}
    
    return {
        reportInfo: state.reports.reportsInfo[ownProps.options.reportId],
        reportData: state.reports.reportsdata[ownProps.options.reportId],
		requesting: state.reports.reportsdata[ownProps.options.reportId].requesting,
		requestError: state.reports.reportsdata[ownProps.options.reportId].requestError,
    };
}

export default connect(mapStateToProps)(GraphReport);