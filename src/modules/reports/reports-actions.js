import { SQLITE3_DB_PATH } from "../session/db-settings";

const sqlite3 = window.require('sqlite3').verbose()
const log = window.require('electron-log');
const MongoClient = window.require('mongodb').MongoClient;


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

export function getReportFields(reportId){
    return (dispatch, getState) => {
        dispatch(requestReportFields(reportId));
		
		//For now let's get the fields from the first records returned from the query 
		//@TODO: Pick from sqlite db the connection details
		const url = `mongodb://127.0.0.1:27017/boda`;

		MongoClient.connect(url, { useNewUrlParser: true }, function(err, mongodb) {
		  if(err !== null){
			log.error(`Failed to connect to ${url}. ${err}`)
			return;
			//@TODO: Create failure notifiation action
			//return dispatch(notifyReceiveReportFieldsFailure(reportId, `Failed to connect to ${url}. ${err}`));
		  }
		  
		  let gcell = mongodb.db().collection('huawei_cm_gcell').findOne({},{_id: 0},(err, doc) => {
			  console.log(doc);			  
			  return dispatch(receiveReportFields(reportId, Object.keys(doc)));
			  
		  });
		  
		  mongodb.close();
		});

    }
}

export function getReports(){
    return (dispatch, getState) => {
        dispatch(requestReports());
		
		
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.all("select \
					r.rowid as id,  \
					r.name as name, \
					c.rowid as cat_id, \
					c.name as cat_name \
				from reports r \
				inner join rpt_categories c on r.category_id = c.rowid",  (err, rows) => {
					
			if(err !== null){
				log.error(err);
				dispatch(notifyReportRequestError(err.toString()));
				return;
			}

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
					catIndexMap[item.cat_name] = catIndex
					
					//Add the first report
					reports[catIndex].reports.push({
						id: item.id,
						name: item.name
					})
					
					return;
				}
				
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
