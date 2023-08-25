import { runQuery } from '../reports/DBQueryHelper.js';
// const log = window.require('electron-log');

//Start fetching cells 
export const GIS_FETCH_CELLS = 'GIS_FETCH_CELLS';

//Start fetching nbrs for a cell 
export const GIS_FETCH_NBRS = 'GIS_FETCH_NBRS';

//Confirm that the cells have been received and add them to the state
export const GIS_CONFIRM_CELLS_RECEIVED = 'GIS_CONFIRM_CELLS_RECEIVED';

//Confirm that the nbrs have been received and add them to the state
export const GIS_CONFIRM_NBRS_RECEIVED = 'GIS_CONFIRM_NBRS_RECEIVED';

//Hide nbrs for a cell
export const GIS_HIDE_CELL_NBRS = 'GIS_HIDE_CELL_NBRS';

export const GIS_HIDE_RELATION = 'GIS_HIDE_RELATION';

export const GIS_SHOW_RELATION = 'GIS_SHOW_RELATION';

export const GIS_CLEAR  = 'GIS_CLEAR';

export const GIS_UPDATE_PLAN_CARRIERS = 'GIS_UPDATE_PLAN_CARRIERS';

export const GIS_UPDATE_CARRIER_COLOR = 'GIS_UPDATE_CARRIER_COLOR';

export const GIS_UPDATE_SECTOR_RADIUS = 'GIS_UPDATE_SECTOR_RADIUS';

export function gisUpdateSectorRadius(tech, radius){
	return {
		type: GIS_UPDATE_SECTOR_RADIUS,
		tech: tech,
		radius: radius
	}
}

export function gisUpdateCarrierColor(carrier, color){
	return{
		type: GIS_UPDATE_CARRIER_COLOR,
		carrier: carrier,
		color: color
	}
}

export function gisUpdatePlanCarriers(frequencies){
	return{
		type: GIS_UPDATE_PLAN_CARRIERS,
		frequencies: frequencies
	}
}


//Convert array to object
const arrayToObject = (array, id) =>
   array.reduce((obj, item) => {
     obj[item[id]] = item
     return obj
   }, {})
   
/*
* Show error on the left panel
*/
export const GIS_SHOW_ERROR = 'GIS_SHOW_ERROR';
export const GIS_SHOW_SUCCESS = 'GIS_SHOW_SUCCESS';
export const GIS_SHOW_INFO = 'GIS_SHOW_INFO';

export function gisFetchCells(){
	return {
		type: GIS_FETCH_CELLS
	};
}

/*
* Get the neighbour list for the give cell id 
* 
* @param integer ci Cell Identity
*/
export function gisFetchNbrs(ci){
	return {
		type: GIS_FETCH_NBRS,
		ci: ci
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


/*
*
* @param array cells list of nbr cell ids 
*/
export function gisConfirmNbrsReceived(svrCI, nbrs){
	return {
		type: GIS_CONFIRM_NBRS_RECEIVED,
		ci: svrCI,
		nbrs: nbrs
	};
}


export function gisShowError(errorMsg){
	return {
		type: GIS_SHOW_ERROR,
		message: errorMsg
	}
}

export function gisShowSuccess(successMsg){
	return {
		type: GIS_SHOW_SUCCESS,
		message: successMsg
	}
}

export function gisShowInfo(infoMsg){
	return {
		type: GIS_SHOW_INFO,
		message: infoMsg
	}
}


export function gisGetCells(){
	return async (dispatch, getState) => {
		dispatch(gisFetchCells());
		
		const results = await runQuery('SELECT * FROM plan_network.vw_cells');
		if(typeof results.error !== 'undefined'){
			btslite_api.addToLog(results.error, 'error');
			return dispatch(gisShowError("Failed to retreive cells"));
		}

		//@todo: handle case when there is an error
		if(results === false ) return;

		dispatch(gisConfirmCellsReceived(arrayToObject(results.rows, 'ci')));
		dispatch(gisShowSuccess("Cells successfull retrieved"));
	}
}

/*
* Get nbrs for a given cell
*
* @param integer svrCI Neighbour CI 
*
*/
export function gisGetNbrs(svrCI){
	return async (dispatch, getState) => {
		dispatch(gisFetchNbrs(svrCI));
		
		const results = await runQuery(`SELECT svr_ci, nbr_ci FROM plan_network.relations r WHERE svr_ci = ${svrCI}`);
		if(typeof results.error !== 'undefined'){
			btslite_api.addToLog(results.error, 'error');
			return dispatch(gisShowError("Failed to retreive neighbours"));
		}
		
		dispatch(gisConfirmNbrsReceived(svrCI, results.rows));
		dispatch(gisShowSuccess("Neighbours successfull retrieved"));
	}
}

export function gisFetchPlanFrequencies(){
	return async (dispatch, getState) => {
		
		const results = await runQuery(`SELECT  DISTINCT  frequency  FROM plan_network.vw_cells`);
		if(typeof results.error !== 'undefined'){
			btslite_api.addToLog(results.error, 'error');
			return dispatch(gisShowError("Failed to retreive neighbours"));
		}

		console.log(results);
		
		//dispatch(gisUpdatePlanCarriers(results.rows.map(f => f.frequency)));
	}
}

/*
* Hide nbrs for a cell
*
* @param integer svrCI Cell ID 
*/
export function gisHideCellNbrs(svrCI){
	return {
		type: GIS_HIDE_CELL_NBRS,
		ci: svrCI
	}
}


export function gisHideRelation(svrCI, nbrCI){
	return {
		type: GIS_HIDE_RELATION,
		svr_ci: svrCI,
		nbr_ci: nbrCI
	}
}

export function gisClear(){
	return {
		type: GIS_CLEAR
	}
}