import { GIS_CONFIRM_CELLS_RECEIVED, GIS_CONFIRM_NBRS_RECEIVED,
		//Notifications
		//GIS_SHOW_ERROR,
		//GIS_SHOW_SUCCESS,
		//GIS_SHOW_INFO,
		GIS_HIDE_CELL_NBRS,
		GIS_HIDE_RELATION,
		GIS_CLEAR,
		GIS_UPDATE_PLAN_CARRIERS,
		GIS_UPDATE_CARRIER_COLOR,
		GIS_UPDATE_SECTOR_RADIUS} from './gis-actions';

const initialState = {
	cells: [],
	relations: {},
	redraw : 0,
	
	//List of relations to hide
	hiddenRelations: {},
	carrierLayer: {},
	
	//Colors to use for each carrier
	carrierColors: ["#0251a6", "#498354", "#66aebd", "#4a8bae", "#2f4285", "#edb1ff", "#a960ed", "#007bff", "#432ab7", "#427ff5", "#88075f", "#cc5d96", "#fb0998", "#fa1bfc", "#9a789e", "#20c997", "#76480d", "#b1e632", "#19a71f", "#20f53d"],
	carrierColorMap: {},
	
	//Radius of the sectors
	sectorRadius: {
		'gsm': 300,
		'umts':200,
		'lte': 100,
	}
};

function gis(state = initialState, action) {
    switch (action.type) {
		case GIS_CONFIRM_CELLS_RECEIVED:
			return {
				...state,
				cells: action.cells
			}
		case GIS_CONFIRM_NBRS_RECEIVED:
			//Show hidden relations 
			let  rlns = {}
			Object.keys(state.hiddenRelations).forEach(key => {
				let re = new RegExp(`^${action.ci}-`);
				if(!key.match(re)) rlns[key] = 1;
			});
		
			return {
				...state,
				relations: {
					...state.relations,
					[action.ci]: action.nbrs
				},
				redraw: state.redraw + 1,
				hiddenRelations: rlns
			}
		case GIS_HIDE_CELL_NBRS: 
			let relations  = state.relations;
			delete relations[action.ci];
			
			console.log("delete relations[action.ci];:", relations);
			
			return {
				...state,
				relations: relations,
				redraw: state.redraw + 1
			}
		case GIS_HIDE_RELATION: 
			return {
				...state,
				hiddenRelations:{
					...state.hiddenRelations, 
					[action.svr_ci + "-" + action.nbr_ci]: {}
				} 
			}
		case GIS_UPDATE_PLAN_CARRIERS:
			var colorMap = {};
			action.frequencies.forEach((f, i) => {
				colorMap[f] = state.carrierColorMap[f] || state.carrierColors[i];
			});
			return {
				...state,
				carrierColorMap: colorMap
			}
		case GIS_CLEAR:
			return initialState;
		case GIS_UPDATE_CARRIER_COLOR:
			return {
				...state,
				carrierColorMap: {
					...state.carrierColorMap,
					[action.carrier]: action.color
				}
			}
		case GIS_UPDATE_SECTOR_RADIUS:
			return {
				...state,
				sectorRadius: {
					...state.sectorRadius,
					[action.tech]: action.radius || initialState.sectorRadius[action.tech]
				}
			}
        default:
            return state;	
	}
}

export default gis;