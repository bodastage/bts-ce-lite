import React from 'react';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import { getGraphData } from './reports-actions';
import { Icon, ButtonGroup, Button, Intent, Toaster, Callout,
		 Dialog, Classes, ResizeSensor, Spinner  } from "@blueprintjs/core";

class GraphReport extends React.Component{
    static icon = "table";
    static label = "";
    
    constructor(props){
        super(props);
        
        this.state = {
            width: window.innerWidth - 500
        }
        this.handleResize = this.handleResize.bind(this)
        this.updatePlotData.bind(this)
		this.refreshData = this.refreshData.bind(this)
		
		this.handleDialogOpen = this.handleDialogOpen.bind(this)
		this.handleDialogClose = this.handleDialogClose.bind(this)

        //Plot data and options/settings
        this.plotData = []
        this.layoutOptions = {width: this.state.width, height: null, autosize: false, title: null}
		
		this.toaster = new Toaster();
		
		this.height = window.innerHeight - Math.ceil(window.innerHeight/4);

    }       
    
    componentDidMount(){
        this.props.dispatch(getGraphData(this.props.options.reportId));
    }
    
    handleDialogOpen = () => this.setState({ isDialogOpen: true });
    handleDialogClose = () => this.setState({ isDialogOpen: false });
	
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
	
	handleResize = (entries) => {
		console.log("=============================================");
		console.log("handleResize: ", entries);
		
		const width = entries[0].contentRect.width;
		this.height = entries[0].contentRect.height - Math.ceil(entries[0].contentRect.height/4);
		this.setState({width: width})
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
		
		const height = this.props.height;

		//If there is an error with the query
        if( this.props.requestError !== null ){
            return (
                <div>
                    <Callout intent={Intent.DANGER}> {this.props.requestError}</Callout>
				</div>		
				);
        }
		
        //Show spinner as we wait for data i.e. state.reports.reportsdata[id].data
        if( this.props.reportInfo === null ){
            return (
				<Spinner size={Spinner.SIZE_LARGE} className="mt-5"/>
			);
        }
		


		
        if(this.props.reportInfo !== null){
            let plotOptions = this.props.reportInfo.options;
            this.plotData = this.updatePlotData(plotOptions.data)
            this.layoutOptions = plotOptions.layout
            plotTitle = this.props.reportInfo.name
        }
        

        return (
		<div>	
			<ButtonGroup minimal={true} className="float-right">
				<Button icon="refresh" onClick={this.refreshData} ></Button>
				<Button icon="info-sign" onClick={this.handleDialogOpen} ></Button>
			</ButtonGroup>
			
			<ResizeSensor onResize={this.handleResize}>
				<div style={{ width: "100%", height: height, display:"flex"}}>
					<Plot
						data={this.plotData}
						layout={{...this.layoutOptions, width: this.state.width, height: height, autosize: false}}
						config={{displaylogo:false}}
						responsive={true}
						useResizeHandler={true}
					/>	
				</div>
			</ResizeSensor>
			
			<Toaster {...this.state} ref={this.refHandlers.toaster} />
			
				{ typeof this.props.reportInfo === 'undefined' ? "" :
				<Dialog
				isOpen={this.state.isDialogOpen}
				onClose={this.handleDialogClose}
				title={this.props.reportInfo.name}
				icon="info-sign"
				>
					<div className={Classes.DIALOG_BODY}>
						<pre>
						{this.props.reportInfo.query}
						</pre>
					</div>
					<div className={Classes.DIALOG_FOOTER}>
						<div className={Classes.DIALOG_FOOTER_ACTIONS}>
							<Button onClick={this.handleDialogClose}>Close</Button>
						</div>
					</div>
				</Dialog>
				}
		</div>	
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