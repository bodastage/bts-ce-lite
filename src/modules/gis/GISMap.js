import React from 'react'
import { connect } from 'react-redux';
import { 
    withLeaflet,
	Map, 
	TileLayer, 
	Popup, 
	Polyline, 
	Marker, 
	Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'leaflet/dist/leaflet.css';
import './gis.css';
import { 
	ResizeSensor, 
	Button, 
	Intent, 
	Icon,
	FormGroup, 
	InputGroup, 
	Checkbox, 
	FileInput, 
	HTMLSelect,
	ProgressBar,
	Switch
	} from "@blueprintjs/core";
import { 
	gisGetCells, 
	gisGetNbrs, 
	gisHideCellNbrs, 
	gisHideRelation, 
	gisClear,
	gisFetchPlanFrequencies,
	gisUpdateCarrierColor,
	gisUpdateSectorRadius
} from './gis-actions';
import { SemiCircle } from 'react-leaflet-semicircle';
import 'react-leaflet-fullscreen-control'
import { FaRss } from "react-icons/fa";
import Control from 'react-leaflet-control';
import { Sidebar, Tab } from 'react-leaflet-sidetabs';
import { 
	FiChevronRight, 
	FiList,
	FiShare2, 
	FiDatabase,
	FiFilter	} from "react-icons/fi";
import 'leaflet-contextmenu'
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css'
import 'leaflet.icon.glyph'
import { renderToString } from 'react-dom/server'
import { ReactLeafletSearch } from 'react-leaflet-search'

const { ipcRenderer} = window.require("electron");
const WrappedSearch = withLeaflet(ReactLeafletSearch)

//Fix icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const IMPORT_FILE_FORMAT = ['BCF', 'TEMS'];

class GISMap extends React.Component{
    static icon = "globe-africa";
    static label = "GIS";
    constructor(props){
        super(props);
		
		//Raduis of sectors per technology
		this.techRadii = {
			'gsm': 700,
			'umts': 500,
			'lte': 250,
			'5g': 200
		};
		
		//Sector angle offset to handle overlapping sectors 
		this.angularOffset = {
			'gsm': 0,
			'umts': 5,
			'lte': 10,
			'5g': 15
		}
		
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
			showLTECells: true,
			show5GCells: true,
			
			//Importing data
			importFile: "",
			importFileFormat: IMPORT_FILE_FORMAT[0],
			processingImport: false,
			importStatusNotice: null,
			
			//Clear data in tables before loading
			clearBeforeLoading: false,
			
			gsmRadius: this.techRadii['gsm'],
			umtsRadius: this.techRadii['umts'],
			lteRadius: this.techRadii['lte'],
			
			//
			updateKey : 0
        }
        
        this.handleResize = this.handleResize.bind(this);
		this.refreshMap = this.refreshMap.bind(this);
		this.showHideNbrsForCell = this.showHideNbrsForCell.bind(this);
		this.showHideRelation = this.showHideRelation.bind(this);
		this.handleFilterTextChangeEvent = this.handleFilterTextChangeEvent.bind(this)
		this.handleEnabledChange = this.handleEnabledChange.bind(this)
		this.handleTechFilterCheckBox = this.handleTechFilterCheckBox.bind(this)
		
		
		this.importFileBGJobListener = null;
		

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
  
	updateRadii = () => {
		this.setState({updateKey: this.state.updateKey+1});
	}
    
	componentWillUnmount(){
		this.props.dispatch(gisClear());
	}
	
    componentDidMount () {
		this.map = this.refs.map.leafletElement;
        const map = this.refs.map.leafletElement;
		
		//Update carrier colors
		this.props.dispatch(gisFetchPlanFrequencies());
        
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
    
	dismissImportStatusNotice = () => {
		this.setState({importStatusNotice: null});
	}
	
	
	onImportFileChange = (e) => {
		if( e.target.files.length === 0) return;
		this.setState({importFile: e.target.files[0].path})
	}
	
		
	onImportFileFormatChange = (e) => {
		this.setState({
			importFileFormat: e.target.value
		});
	}
	
	updateCarrierColor = (e) => {
		this.props.dispatch(gisUpdateCarrierColor(e.target.name, e.target.value));
	}
	
	importMapData = () => {
		//Show error notice if user tries to upload empty file.
		if(this.state.importFile.length === 0 ){
			this.setState({
				importStatusNotice: {
					type: 'danger', 
					message: "No file selected!"
					}
			});
			return;
		}
		
		this.setState({processingImport: true });
		
		let payload = {
			importFile: this.state.importFile,
			format: this.state.importFileFormat,
			truncateTable: this.state.clearBeforeLoading
		}

		//Set processing to true 
		this.setState({processing: true });
		
		ipcRenderer.send('parse-cm-request', 'upload_gis_file', JSON.stringify(payload));
		
		this.importFileBGJobListener = (event, task, args) => {
			const obj = JSON.parse(args)
			if(task !== 'upload_gis_file') return;
			
			//error
			if(obj.status === 'error' && task === 'upload_gis_file' ){
				this.setState({
						importStatusNotice: {type: 'danger', message: obj.message},
						processingImport: false
						});
				ipcRenderer.removeListener("parse-cm-request", this.importFileBGJobListener);
			}
			
			//info
			if(obj.status === 'info' && task === 'upload_gis_file' ){
				this.setImportStatusNotice('info', obj.message)
			}
			
			if(obj.status === "success" && task === 'upload_gis_file' ){
				this.setState({
						importStatusNotice: {
							type: 'success', 
							message: obj.message
							},
						processingImport: false
						});

				ipcRenderer.removeListener("parse-cm-request", this.importFileBGJobListener);
				//Reload the carrier colors
				this.props.dispatch(gisFetchPlanFrequencies());
				
				this.refreshMap();
			}
			
		}
		ipcRenderer.on('parse-cm-request', this.importFileBGJobListener);
	}
	
	setImportStatusNotice = (type,message) => {this.setState({importStatusNotice: {type: type, message: message}})}
	
    handleResize(resizeEntries){

        //this.setState({height: resizeEntries[0].contentRect.height})
        const map = this.refs.map.leafletElement;
        setTimeout(function(){
            map.invalidateSize();
        },1);
    }
    
	handleClearSwitch = () => {
		this.setState({clearBeforeLoading: !this.state.clearBeforeLoading});
	}
	
	handleRadiusChange = (e) => {
		const tech = e.target.name.replace("Radius", "");
		const radius = e.target.value;
		this.props.dispatch(gisUpdateSectorRadius(tech, radius));
	}
	
	
    render(){
		
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
			const beamWidth = parseInt(cell.antenna_beam) > 0 && !isNaN(parseInt(cell.antenna_beam)) ?  cell.antenna_beam : 30;
			const lcTech = cell.technology.toLowerCase(); 
			
			 //Radius. Adjust by  twice the last digit in the ci 
			 const lastDigit = cell.ci.toString()[cell.ci.toString().length-1] || 0;
			
			let radius = this.props.sectorRadius[lcTech] || 500 ;
			radius = parseInt(radius) + (lastDigit-1)*4;

			const color = this.props.carrierColors[cell.frequency] || null;
			return (
				<React.Fragment key={cell.ci}>
					<SemiCircle 
						color={color}
						position={[cell.latitude, cell.longitude]}
						radius={radius}
						startAngle={cell.azimuth + this.angularOffset[lcTech]}
						stopAngle={cell.azimuth + beamWidth + this.angularOffset[lcTech]}
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
		
		let importFileEllipsis = this.state.importFile === '' ? "" : "file-text-dir-rtl"
		
		//Import status notices 
		let importStatusNotice = null;
		if(this.state.importStatusNotice !== null ){ 
			importStatusNotice = (<div className={`alert alert-${this.state.importStatusNotice.type} p-2`} role="alert">{this.state.importStatusNotice.message}
					<button type="button" className="close"  aria-label="Close" onClick={this.dismissImportStatusNotice}>
					<span aria-hidden="true">&times;</span>
				</button>
			</div>)
		}

		
        return (
			<fieldset className="col-md-12 fieldset">    	
				<legend className="legend"><FontAwesomeIcon icon="globe-africa"/> GIS</legend>
            
            <div className="card">
                <div className="card-body p-2" >

                    <div className="map-container" >

                    <ResizeSensor onResize={this.handleResize}>
				
						<Map 
							ref='map' 
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
							fullscreenControl
						>
							<WrappedSearch 
								zoom={12}
								inputPlaceholder="Find a place"
								position="topleft"/>
							
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
							   <Tab id="gis_search" header="Filter" icon={<FiFilter />}>
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
											<Checkbox inline={true} checked={this.state.show5GCells} name="show5GCells" label="5G" onChange={this.handleTechFilterCheckBox} />
										</div>
										
										<div>
											<h6 className="horizontal-line">
												<span className="horizontal-line-text">Environment</span>
											</h6>
											<Checkbox inline={true} checked={this.state.showPlanEnv} 
												name="showPlanEnv" 
												label="Plan" 
												onChange={this.handleTechFilterCheckBox} 
												disabled={true}
											/>
											<Checkbox 
												inline={true} 
												checked={this.state.showLiveEnv} 
												name="showLiveEnv" 
												label="Live" 
												onChange={this.handleTechFilterCheckBox} 
												disabled={true}
											/>
										</div>
										
									</div>
							   </Tab>
							   
							   <Tab id="gis_data" header="Data" icon={<FiDatabase />}>
									<div className="mt-2">
										<div>
											<h6 className="horizontal-line">
												<span className="horizontal-line-text">Upload file</span>
											</h6>
											{ this.state.processingImport ? (<ProgressBar intent={Intent.PRIMARY} className="mt-1  mb-2"/>) : ""}
											{importStatusNotice}
									
											<FileInput disabled={this.state.processingImport} className={"mr-2 " + importFileEllipsis} text={this.state.importFile} onChange={this.onImportFileChange} />
											<HTMLSelect 
												disabled={this.state.processingImport} 
												options={IMPORT_FILE_FORMAT} 
												className="mt-2 mr-2" 
												onChange={this.onImportFileFormatChange}
											/>
											<Switch  disabled={this.state.processingImport} checked={this.state.clearBeforeLoading} label="Delete before loading" onChange={this.handleClearSwitch}/>
											<Button text="Upload" disabled={this.state.processingImport}  icon="upload" className="mt-2" onClick={this.importMapData}/>
										</div>
									</div>
							   </Tab> 
							   
							   <Tab id="gis_properties" header="Properties" icon={<FiList />}>
									<div className="mt-2">
										<div>
											<h6 className="horizontal-line">
												<span className="horizontal-line-text">Radius</span>
											</h6>
												<div className="row">
													<label htmlFor="gsm_radius" className="col-sm-2 col-form-label">GSM</label>
													<div className="col-10">
														<FormGroup
															labelFor="gsm_radius"
															inline={true}
															className="mb-1"
														>
															<InputGroup 
																id="gsm_radius" 
																name="gsmRadius"
																defaultValue={this.props.sectorRadius['gsm']}
																onChange={this.handleRadiusChange}
															/>
														</FormGroup>
													</div>
												</div>
												
												<div className="row">
													<label htmlFor="umts_radius" className="col-sm-2 col-form-label">UMTS</label>
													<div className="col-10">
														<FormGroup
															labelFor="umts_radius"
															inline={true}
															className="mb-1"
														>
															<InputGroup 
																id="umts_radius" 
																name="umtsRadius"
																defaultValue={this.props.sectorRadius['umts']}
																onChange={this.handleRadiusChange}
															/>
														</FormGroup>
													</div>
												</div>
												
												<div className="row">
													<label htmlFor="lte_radius" className="col-sm-2 col-form-label">LTE</label>
													<div className="col-10">
														<FormGroup
															labelFor="lte_radius"
															inline={true}
															className="mb-1"
														>
															<InputGroup 
																name="lteRadius"
																id="lte_radius" 
																defaultValue={this.props.sectorRadius['lte']} 
																onChange={this.handleRadiusChange}/>
														</FormGroup>
													</div>
												</div>
										</div>
										
										<div>
											<h6 className="horizontal-line">
												<span className="horizontal-line-text">Carrier Colors</span>
											</h6>
											<div>
											{Object.keys(this.props.carrierColors).map((v, i) => (
												<div className="row">
													<div className="col-3">{v}</div>
													<div className="col-2">
														<input 
															type="color" 
															name={v} 
															value={this.props.carrierColors[v]} 
															onChange={this.updateCarrierColor}/>
													</div>

												</div>
											))}
												
											</div>
										</div>
										
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
		hiddenRelations: state.gis.hiddenRelations || {},
		carrierColors: state.gis.carrierColorMap,
		sectorRadius: state.gis.sectorRadius
	};
}

export default connect(mapStateToProps)(GISMap);