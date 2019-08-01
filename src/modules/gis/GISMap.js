import React from 'react'
import { Map, TileLayer, Popup, DivOverlay, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'leaflet/dist/leaflet.css';
import './gis.css';
import { ResizeSensor, Popover, Button, Intent, PopoverInteractionKind, Icon } from "@blueprintjs/core";
import { gisGetCells } from './gis-actions';
import { SemiCircle, SemiCircleMarker } from 'react-leaflet-semicircle';
import 'react-leaflet-fullscreen-control'
import { FaRss } from "react-icons/fa";
import Control from 'react-leaflet-control';
import { Sidebar, Tab } from 'react-leaflet-sidetabs';
import { FiHome, FiChevronRight, FiSearch, FiSettings, FiRadio } from "react-icons/fi";
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
			selectedTab: 'home'
        }
        
        this.handleResize = this.handleResize.bind(this);
        this.click = this.click.bind(this);
		this.refreshMap = this.refreshMap.bind(this);
		this.showNbrsForCell = this.showNbrsForCell.bind(this);

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
  
  showNbrsForCell(cellId){
	  
  }
  
    click(e){
        console.log(e)
    }
    
    componentDidMount () {
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
		
        
    }
    
    componentDidUpdate(){
        const map = this.refs.map.leafletElement;
        map.invalidateSize();
		
		//Disable disable dragging and zooming when working with the side panel
		var div = L.DomUtil.get('gis_sidebar');
		//L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
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
		if(this.props.cells.length > 0 ){
			center = [this.props.cells[0].latitude, this.props.cells[0].longitude];
		}
				
		const cellMarkers = this.props.cells.map((cell, i) => (
			<React.Fragment key={cell.ci}>
				<SemiCircle 
					position={[cell.latitude, cell.longitude]}
					radius={500 + i*100}
					startAngle={cell.azimuth/2}
					stopAngle={cell.azimuth}
					weight={2}
					key={cell.ci + "-cell"}
					
					contextmenu={true}
					contextmenuItems={[{
						text: 'Show neighbours',
						callback: this.showNbrsForCell(cell.ci),
						index: 0
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
							   .map(p => (
								<tr>
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
					<Tooltip>{cell.ci}</Tooltip>
				</SemiCircle>
				<Marker 
					position={[cell.latitude, cell.longitude]} 
					zIndexOffset={100} 
					icon={L.divIcon({className: '', html: renderToString(<FontAwesomeIcon icon="broadcast-tower" size="lg"/>) })}>
				</Marker>
			</React.Fragment>
		));
        return (
			<fieldset className="col-md-12 fieldset">    	
				<legend className="legend"><FontAwesomeIcon icon="globe-africa"/> GIS</legend>
            
            <div className="card">
                <div className="card-body p-2" >

                    <div className="map-container" >

		
				
                    <ResizeSensor onResize={this.handleResize}>
				
						<Map ref='map' 
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
							   <Tab id="home" header="Home" icon={<FiHome />}>
								<p>No place like home!</p>
							   </Tab>
							   <Tab id="search" header="Search" icon={<FiSearch />}>
								<p>The noblest search is the search for excellence!</p>
							   </Tab>
							   <Tab id="settings" header="Settings" anchor="bottom" icon={<FiSettings />}>
								<p>We don't want privacy so much as privacy settings!</p>
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
		cells: state.gis.cells || []
	};
}

export default connect(mapStateToProps)(GISMap);