import { GIS_CONFIRM_CELLS_RECEIVED, GIS_CONFIRM_NBRS_RECEIVED,
		//Notifications
		GIS_SHOW_ERROR,
		GIS_SHOW_SUCCESS,
		GIS_SHOW_INFO,
		GIS_HIDE_CELL_NBRS,
		GIS_HIDE_RELATION,
		GIS_CLEAR} from './gis-actions';

const initialState = {
	cells: [],
	relations: {},
	redraw : 0,
	
	//List of relations to hide
	hiddenRelations: {},
	carrierLayer: {}
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
		case GIS_CLEAR:
			return initialState;
        default:
            return state;	
	}
}

export default gis;