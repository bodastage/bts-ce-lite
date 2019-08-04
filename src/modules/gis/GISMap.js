import React from 'react'
import { connect } from 'react-redux';
import { Map, TileLayer, Popup, Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'leaflet/dist/leaflet.css';
import './gis.css';
import { ResizeSensor, Popover, Button, Intent, PopoverInteractionKind, Icon,
		 FormGroup, InputGroup, Checkbox } from "@blueprintjs/core";
import { gisGetCells, gisGetNbrs, gisHideCellNbrs, gisHideRelation, gisClear } from './gis-actions';
import { SemiCircle, SemiCircleMarker } from 'react-leaflet-semicircle';
import 'react-leaflet-fullscreen-control'
import { FaRss } from "react-icons/fa";
import Control from 'react-leaflet-control';
import { Sidebar, Tab } from 'react-leaflet-sidetabs';
import { FiHome, FiChevronRight, FiSearch, FiSettings, FiRadio, FiArrowRight, FiShare2 } from "react-icons/fi";
import 'leaflet-contextmenu'
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css'
import 'leaflet.icon.glyph'
import { renderToString } from 'react-dom/server'

//Fix icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

class GISMap extends React.Component{
    static icon = "globe-africa";
    static label = "GIS";
    constructor(props){
        super(props);
        this.state = {
            lat: 51.505,
            lng: -0.09,
            zoom: 13,
            height: window.innerHeight-150,
			sideBarCollapsed: true,
			selectedTab: 'home',
			
			filterText: "",
			
			//Technology filter
			showGSMCells: true,
			showUMTSCells: true,
			showLTECells: true
        }
        
        this.handleResize = this.handleResize.bind(this);
        this.click = this.click.bind(this);
		this.refreshMap = this.refreshMap.bind(this);
		this.showHideNbrsForCell = this.showHideNbrsForCell.bind(this);
		this.showHideRelation = this.showHideRelation.bind(this);
		this.handleFilterTextChangeEvent = this.handleFilterTextChangeEvent.bind(this)
		this.handleEnabledChange = this.handleEnabledChange.bind(this)
		this.handleTechFilterCheckBox = this.handleTechFilterCheckBox.bind(this)
    }
    
  onSideBarClose() {
    this.setState({sideBarCollapsed: true});
  }
  
  onSideBarOpen(id) {
    this.setState({
      sideBarCollapsed: false,
      selectedTab: id,
    })
  }
  
  handleTechFilterCheckBox = (event) => {
	const name = event.target.name;
	
	//Toggle value 
	this.setState({
	  [name]: !this.state[name]
	});
		
  }
  
  handleEnabledChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        		
		console.log("handleEnabledChange:", value, name);
				
        this.setState({
          [name]: value
        });
  }
  
  
  /*
  *
  *
  */
  handleFilterTextChangeEvent = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        this.setState({
          [name]: value
        });
  }
  
  showHideRelation(svrCI, nbrCI){
	  this.props.dispatch(gisHideRelation(svrCI, nbrCI));
  }
  
  showHideNbrsForCell(cellId){
	if(typeof this.props.relations[cellId] === 'undefined'){
		this.props.dispatch(gisGetNbrs(cellId));
	}else{
		this.props.dispatch(gisHideCellNbrs(cellId));
	}
	  
  }
  
    click(e){
        console.log(e)
    }
    
	componentWillUnmount(){
		this.props.dispatch(gisClear());
	}
    componentDidMount () {
		this.map = this.refs.map.leafletElement;
        const map = this.refs.map.leafletElement;
        
        //By the time the GIS tab is shown, the GIS component has already
        //been mounted. As a result, leaflet does not display correctly because
        //it cannot determine the height value of an HTML element with 
        //display:none. This re-renders the map correctly after the tab is shown.
        setTimeout(function(){
            map.invalidateSize();
        },1000);
		
		
		this.props.dispatch(gisGetCells());
		
		//Add context menu 
		
        this.map = null;
    }
    
    componentDidUpdate(){
        const map = this.refs.map.leafletElement;
		
        map.invalidateSize();
		
		//Disable disable dragging and zooming when working with the side panel
		var div = L.DomUtil.get('gis_sidebar');
		L.DomEvent.on(div, 'mouseover', function(){
			map.dragging.disable();
			map.touchZoom.disable();
			map.doubleClickZoom.disable();
			map.scrollWheelZoom.disable();
		});
		
		L.DomEvent.on(div, 'mouseout', function(){
			map.dragging.enable();
			map.touchZoom.enable();
			map.doubleClickZoom.enable();
			map.scrollWheelZoom.enable();
		});
		
		//map.ContextMenu .removeAllItems();
    }
	
	centerMap(e){
		const map = this.refs.map.leafletElement;
		map.panTo(e.latlng);
	}
	
	refreshMap(){
		this.props.dispatch(gisGetCells());
	}
    
    handleResize(resizeEntries){

        //this.setState({height: resizeEntries[0].contentRect.height})
        const map = this.refs.map.leafletElement;
        setTimeout(function(){
            map.invalidateSize();
        },1);
    }
    
    render(){
        const position = [this.state.lat, this.state.lng]
        const height = this.state.height;
		let center = [this.state.lat, this.state.lng]

		//Get the first cell
		if(Object.keys(this.props.cells).length > 0 ){
			const someCI = Object.keys(this.props.cells)[0]
			center = [this.props.cells[someCI].latitude, this.props.cells[someCI].longitude];
		}
		
		var that = this;
		const cellMarkers = Object.keys(this.props.cells)
		//Filter based on search text
		.filter((cellid, i) => {
			const cell = this.props.cells[cellid];
				
			//Technology 
			let techMatch = false;
			const cellTech = cell.technology.toLowerCase();
			if(that.state.showGSMCells === true && cellTech === 'gsm') techMatch = techMatch || true;
			if(that.state.showUMTSCells === true && cellTech === 'umts') techMatch = techMatch || true;;
			if(that.state.showLTECells === true && cellTech === 'lte') techMatch = techMatch || true;;
			if(techMatch === false) return false;
			
			//When no search text, show all 
			if(that.state.filterText.length === 0 ) return true;
			
			try{
				const re = new RegExp(that.state.filterText, 'i')
				
				if(cellid.match(re) || cell.cellname.match(re)) return true;
			}catch(e){
				//@TODO: 
			}
			
			return false;
		})
		.map((cellid, i) => {
			const cell = this.props.cells[cellid];
			const beamWidth = parseInt(cell.antenna_beam) > 0 && parseInt(cell.antenna_beam) !== NaN ?  cell.antenna_beam : 30;
			return (
				<React.Fragment key={cell.ci}>
					<SemiCircle 
						position={[cell.latitude, cell.longitude]}
						radius={500}
						startAngle={cell.azimuth}
						stopAngle={cell.azimuth + beamWidth}
						weight={2}
						key={cell.ci + "-cell"}
						
						contextmenu={true}
						contextmenuItems={[{
							text: 'Show/hide neighbours',
							callback: () => this.showHideNbrsForCell(cell.ci),
							index: 0
						}, {
							text: 'KPIs',
							callback: () => {},
							index: 1
						},{
							separator: true,
							index: 2
						}]}
					>
						<Popup className="bp3-popover bp3-popover-content-sizing">
						<span><FaRss className="mb-1"/> {cell.cellname}</span> 
						<div className="gis-cell-table-wrapper">
							<div className="gis-cell-table-scroll">
							<table className="table table-hover table-sm">
							  <thead>
								<tr>
								  <th><span className="text">Parameter</span></th>
								  <th><span className="text">Value</span></th>
								</tr>
							  </thead>
							  <tbody>
							   {
								   Object.keys(cell)
								   .map((p, ip) => (
									<tr key={"p-"+ip}>
									  <td>{p}</td>
									  <td>{cell[p]}</td>
									</tr>
									))
							   }	
							  </tbody>
							</table>
							</div>
						</div>
						</Popup>
						<Tooltip>{`${cell.cellname}(${cell.ci})`}</Tooltip>
					</SemiCircle>
					<Marker 
						position={[cell.latitude, cell.longitude]} 
						zIndexOffset={100} 
						icon={L.divIcon({className: '', html: renderToString(<FontAwesomeIcon icon="broadcast-tower" size="lg"/>) })}>
					</Marker>
				</React.Fragment>
		)});
		
		
		let relations = []
		Object.keys(this.props.relations).forEach((svrCI, i) => {
			relations = relations.concat(this.props.relations[svrCI])
		});
		
		const relationLines =  relations
		//Hide some relations
		.filter(rln => this.props.hiddenRelations[rln.svr_ci + "-" + rln.nbr_ci] === undefined)
		.map((rln, i) => {
			return (
				<React.Fragment key={rln.svr_ci + "-" + rln.nbr_ci}>
					<Polyline 
						color={"red"} 
						positions={[
							[this.props.cells[rln.svr_ci].latitude, this.props.cells[rln.svr_ci].longitude],
							[this.props.cells[rln.nbr_ci].latitude, this.props.cells[rln.nbr_ci].longitude]
						]}
						
						contextmenu={true}
						contextmenuItems={[{
							text: 'Hide relation',
							callback: () => this.showHideRelation(rln.svr_ci, rln.nbr_ci),
							index: 0
						},{
							separator: true,
							index: 1
						}]}
					>
					<Tooltip>{this.props.cells[rln.svr_ci].cellname + " > " + this.props.cells[rln.nbr_ci].cellname}</Tooltip>
					<Popup className="bp3-popover bp3-popover-content-sizing">
						<FiShare2 className="mb-1"/>	Relation parameters
					</Popup>
					
					
					</Polyline>
				</React.Fragment>
			);
		});
		
		const displayCellCount = cellMarkers.length;
		
		console.log("this.state.showGSMCells", this.state.showGSMCells);
		
        return (
			<fieldset className="col-md-12 fieldset">    	
				<legend className="legend"><FontAwesomeIcon icon="globe-africa"/> GIS</legend>
            
            <div className="card">
                <div className="card-body p-2" >

                    <div className="map-container" >

		
				
                    <ResizeSensor onResize={this.handleResize}>
				
						<Map ref='map' 
							attributionControl={false}
							center={center} 
							zoom={this.state.zoom} 
							style={{height: height + 'px'}} 
							contextmenu={true}
							contextmenuItems={[{
								text: 'Center map here',
								callback: this.centerMap.bind(this),
								index: 0
							}]}
							fullscreenControl>
							<TileLayer
							  attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
							  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
							
							{cellMarkers}
							
							{relationLines}

							<Control position="topleft" >
								<div className="leaflet-control-layers p-2">
									<Icon icon="refresh" onClick={this.refreshMap}/>
								</div>
							</Control>
							
							<Sidebar
							  id="gis_sidebar"
							  position="right"
							  collapsed={this.state.sideBarCollapsed}
							  closeIcon={<FiChevronRight />}
							  selected={this.state.selectedTab}
							  onOpen={this.onSideBarOpen.bind(this)}
							  onClose={this.onSideBarClose.bind(this)}
							>
							   <Tab id="gis_search" header="Filter" icon={<FiSearch />}>
									<div className="mt-2">
										<FormGroup
											label=""
											labelFor="search_network"
										>
											<InputGroup 
												id="search_network" 
												placeholder="Search network..." 
												leftIcon="search" 
												name="filterText"
												type="text"
												value={this.state.filterText} 
												onChange={this.handleFilterTextChangeEvent}
											/>
										</FormGroup>
										<div className="bp3-text-small bp3-text-muted font-italic">{this.state.filterText.length > 0 ? `Found ${displayCellCount} cells.` : "" }</div>
										
										<div>
											<h6 className="horizontal-line">
												<span className="horizontal-line-text">Technology</span>
											</h6>
											<Checkbox inline={true} checked={this.state.showGSMCells} name="showGSMCells" label="GSM" onChange={this.handleTechFilterCheckBox} />
											<Checkbox inline={true} checked={this.state.showUMTSCells} name="showUMTSCells" label="UMTS" onChange={this.handleTechFilterCheckBox} />
											<Checkbox inline={true} checked={this.state.showLTECells} name="showLTECells" label="LTE" onChange={this.handleTechFilterCheckBox} />
										</div>
										
									</div>
							   </Tab>
							   <Tab id="gis_settings" header="Settings" anchor="bottom" icon={<FiSettings />}>
									<div className="mt-2">
									
									</div>
							   </Tab>           
							</Sidebar>
							
						</Map>
                    </ResizeSensor>
                    </div>
                </div>
            </div>
        </fieldset>
        );
    }
}

function mapStateToProps(state){
	return {
		cells: state.gis.cells || {},
		relations: state.gis.relations || {},
		redraw: state.gis.redraw,
		hiddenRelations: state.gis.hiddenRelations || {}
	};
}

export default connect(mapStateToProps)(GISMap);