import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { Button, Card, Elevation, ResizeSensor, Spinner, Icon } from "@blueprintjs/core";
import '../../../node_modules/react-grid-layout/css/styles.css'
import '../../../node_modules/react-resizable/css/styles.css'
import GridLayout , { WidthProvider, Responsive  } from 'react-grid-layout';
import './composite-report-stats.css'
import { getReportInfo } from './reports-actions';
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
            countsUpdated: false
        }
        
        this.handleResize = this.handleResize.bind(this)
        this.onLayoutChange = this.onLayoutChange.bind(this)
   }

    componentDidMount(){
		this.props.dispatch(getReportInfo(4));
	}
	
    handleResize(resizeEntries){
		const width = resizeEntries[0].contentRect.width;
        this.setState({width: width === 0 ? this.state.width: width })
    }
	
	showReport(reportId){
		this.props.dispatch(getReportInfo(this.props.options.reportId));
		
	}
	
    onLayoutChange(layout){
    }
	
    render(){
		
		const layout = this.props.reportInfo.options.layout;
		
		let gridBoxes = layout.map((val) => {
			return (
			<div key={val["i"]} className="rgl-border">
				<div className="card-header ">{this.props.reportsInfo[val.i] ? this.props.reportsInfo[val.i].name : "Loading..."}</div>
				<div className="rgl-body">
					<div className="mt-2 p-2" style={{height: this.state.rowHeight*val.h-25}}>
						<CompositeReportContainer options={{reportId: val.i, title: "Composite Report"}}/>
					</div>
				</div>
			</div>);
		})
        
       return (

           <div><ResizeSensor onResize={this.handleResize}>
            <GridLayout className="layout" 
                onLayoutChange={this.onLayoutChange}
              draggableHandle=".card-header"
              layout={layout} 
              cols={4} 
              margin={[2,2]}
              rowHeight={this.state.rowHeight} width={this.state.width}>
              {gridBoxes}
            </GridLayout>
          </ResizeSensor></div>
        )
	}
}


function mapStateToProps(state, ownProps){
    
    return {
		reportsInfo: state.reports.reportsInfo
    };
}

export default connect(mapStateToProps)(CreateCompositeReport);