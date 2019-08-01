import { runQuery } from '../reports/DBQueryHelper.js';
const log = window.require('electron-log');

//Start fetching cells 
export const GIS_FETCH_CELLS = 'GIS_FETCH_CELLS';

//Confirm that the cells have been received
export const GIS_CONFIRM_CELLS_RECEIVED = 'GIS_CONFIRM_CELLS_RECEIVED';

/*
* Show error on the left panel
*/
export const GIS_SHOW_ERROR_IN_LEFT_PANEL = 'GIS_SHOW_ERROR_IN_LEFT_PANEL';
export const GIS_SHOW_SUCCESS_IN_LEFT_PANEL = 'GIS_SHOW_SUCCESS_IN_LEFT_PANEL';
export const GIS_SHOW_INFO_IN_LEFT_PANEL = 'GIS_SHOW_INFO_IN_LEFT_PANEL';

export function gisFetchCells(){
	return {
		type: GIS_FETCH_CELLS
	};
}

/*
*
* @param array cells list of cells 
*/
export function gisConfirmCellsReceived(cells){
	return {
		type: GIS_CONFIRM_CELLS_RECEIVED,
		cells: cells
	};
}


export function gisShowErrorInLeftPanel(errorMsg){
	return {
		type: GIS_SHOW_ERROR_IN_LEFT_PANEL,
		message: errorMsg
	}
}

export function gisShowSuccessInLeftPanel(successMsg){
	return {
		type: GIS_SHOW_SUCCESS_IN_LEFT_PANEL,
		message: successMsg
	}
}

export function gisShowInfoInLeftPanel(infoMsg){
	return {
		type: GIS_SHOW_INFO_IN_LEFT_PANEL,
		message: infoMsg
	}
}


export function gisGetCells(){
	return async (dispatch, getState) => {
		dispatch(gisFetchCells());
		
		const results = await runQuery('SELECT * FROM plan_network.vw_cells');
		if(typeof results.error !== 'undefined'){
			log.error(results.error);
			return dispatch();
		}
		
		dispatch(gisConfirmCellsReceived(results.rows));
		dispatch(gisShowSuccessInLeftPanel("Cells successfull retrieved"));
	}
}
