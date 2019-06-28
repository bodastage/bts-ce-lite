import { SQLITE3_DB_PATH } from "../session/db-settings";

const sqlite3 = window.require('sqlite3').verbose()
const log = window.require('electron-log');
const { Client } = window.require('pg');


export const REQUEST_REPORTS = 'REQUEST_REPORTS';
export const RECEIVE_REPORTS = 'RECEIVE_REPORTS';
export const NOTIFY_REPORT_REQUEST_ERROR = 'NOTIFY_REQUEST_ERROR';
export const DISMISS_REPORT_REQUEST_ERROR = 'DISMISS_REQUEST_ERROR';

export const REQUEST_REPORT_FIELDS = 'REQUEST_REPORT_FIELDS';
export const RECEIVE_REPORT_FIELDS = 'RECEIVE_REPORT_FIELDS';
export const NOTIFY_REPORT_FIELDS_REQUEST_ERROR = 'NOTIFY_REPORT_FIELDS_REQUEST_ERROR';
export const DISMISS_REPORT_FIELDS_REQUEST_ERROR = 'DISMISS_REPORT_FIELDS_REQUEST_ERROR';

export const SET_REPORTS_FILTER = 'SET_REPORTS_FILTER';

export const CLEAR_REPORT_TREE_ERROR = 'CLEAR_REPORT_TREE_ERROR';
export const REQUEST_REPORT = 'REQUEST_REPORT';
export const RECEIVE_REPORT = 'REQUEST_REPORT';


export function clearReportTreeError(){
    return {
        type: CLEAR_REPORT_TREE_ERROR
    }
}

export function requestReport(reportId){
    return {
        type: REQUEST_REPORT,
        reportId: reportId
    }
}


export function requestReports(){
    return {
        type: REQUEST_REPORTS
    };
}

export function receiveReports(reports){
    return {
        type: RECEIVE_REPORTS,
        reports: reports
    };
}

export function notifyReportRequestError(error){
    return {
        type: NOTIFY_REPORT_REQUEST_ERROR,
        error: error
    };
}

export function dismissReportRequestError(){
    return {
        type: DISMISS_REPORT_REQUEST_ERROR
    };
}

export function setReportFilter(filterText, filterCategories, filterReport){
    return {
        type: SET_REPORTS_FILTER,
        filter: {
            text: filterText,
            categories: filterCategories, 
            reports: filterReport 
        }
    };
}


export function receiveReportFields(reportId, fields){
    return {
        type: RECEIVE_REPORT_FIELDS,
        reportId: reportId,
        fields: fields
    };
}

export function requestReportFields(reportId){
    return {
        type: REQUEST_REPORT_FIELDS,
        reportId: reportId
    };
}


/**
 * Receive report details/info.
 * 
 * @returns {undefined}
 */
export function receiveReport(reportId, reportInfo){
    return {
        type: RECEIVE_REPORT,
        reportId: reportId,
        reportInfo: reportInfo
    };
}

//Get details for a single report
export function getReportInfo(reportId){
    return (dispatch, getState) => {
        dispatch(requestReport(reportId));
		
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.all("SELECT * FROM reports WHERE rowid = ?", [reportId], (err, rows) => {
			if(err !== null){
				log.error(err);
				dispatch(notifyReportRequestError(err.toString()));
				return;
			}
			
			return dispatch(receiveReport(reportId, rows[0]));
			
		});
    }
}

/**
* Get table report fields
*
* @param String reportId
*/
export function getReportFields(reportId){
    return (dispatch, getState) => {
        dispatch(requestReportFields(reportId));
		
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.all("SELECT * FROM databases WHERE name = ?", ["boda"] , (err, row) => {
			if(err !== null){
				log.error(row);
				//@TODO: Show table data log error
				return;
			}
			
			const hostname = row[0].hostname;
			const port = row[0].port;
			const username = row[0].username;
			const password = row[0].password;
			
			//get report details 
			db.all("SELECT * FROM reports r WHERE rowid = ?",[reportId], (rErr, rRows) => {
				if(rErr !== null){
					log.error(rRows);
					//@TODO: Show table data log error
					return dispatch(receiveReportFields(reportId, []));
				}
				
				let query = rRows[0].query;
				
				//For now let's get the fields from the first records returned from the query 
				//@TODO: Pick from sqlite db the connection details
				//const url = `mongodb://127.0.0.1:27017/boda`;
				
				const connectionString = `postgresql://${username}:${password}@${hostname}:${port}/boda`
				
				const client = new Client({
				  connectionString: connectionString,
				});
				
				client.connect((err) => {
					if(err){
						log.error(`Failed to connect to ${connectionString}. ${err}`)
						return dispatch(receiveReportFields(reportId, []));
						//@TODO: Create failure notifiation action
						//return dispatch(notifyReceiveReportFieldsFailure(reportId, `Failed to connect to ${url}. ${err}`));
					}
				});
				
			client.query(`SELECT * FROM (${query}) t LIMIT 0`)
				.then( result => {
					console.log(result);
					let fields = result.fields.map((v,i) => v.name );
					return dispatch(receiveReportFields(reportId, fields));
				} )
				.catch(e => {
					//@TODO: Error notice
					return dispatch(receiveReportFields(reportId, []));	
				})
				.then(() => client.end());
				
			});//db.all()
			

			
		});//db.all- get db connection details


    }
}

export function getReports(){
    return (dispatch, getState) => {
        dispatch(requestReports());
		
		
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.all("SELECT \
					r.rowid as id,  \
					r.name as name, \
					c.rowid as cat_id, \
					c.name as cat_name \
				FROM rpt_categories c \
				LEFT join reports r  ON r.category_id = c.rowid		",  (err, rows) => {
					
			if(err !== null){
				log.error(err);
				dispatch(notifyReportRequestError(err.toString()));
				return;
			}

			/*
			* Holds an list/array of categories and  for each category there is an list/array of reports
			*/
			let reports = []
			let catIndexMap = {} //Map of category names to ids
			
			rows.forEach((item, index) => {
				
				if(typeof catIndexMap[item.cat_name] === 'undefined'){ //this is a new category
					reports.push({
						cat_id: item.cat_id,
						cat_name: item.cat_name,
						reports: []
					})
					
					let catIndex = reports.length - 1
					catIndexMap[item.cat_name] = catIndex;
				}
				
				//No report info
				if(item.id === null) return;
				
				//At this point we already have the category so we update the report list
				let catIndex = catIndexMap[item.cat_name];
				reports[catIndex].reports.push({
					id: item.id,
					name: item.name
				})
			});
			
			return dispatch(receiveReports(reports));
			
				
		});
        
        
    }
}

/**
 * Request report details 
 * 
 * @param {type} reportId
 * @returns {undefined}
 */
export function getReport(reportId){
    return (dispatch, getState) => {
        
    }
}
