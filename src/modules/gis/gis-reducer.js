import { GIS_CONFIRM_CELLS_RECEIVED } from './gis-actions';

const initialState = {
	cells: []
};

function gis(state = initialState, action) {
    switch (action.type) {
		case GIS_CONFIRM_CELLS_RECEIVED:
			return {
				...state,
				cells: action.cells
			}
        default:
            return state;	
	}
}

export default gis;