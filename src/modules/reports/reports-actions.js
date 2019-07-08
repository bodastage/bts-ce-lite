import { SQLITE3_DB_PATH } from "../session/db-settings";
import { runQuery, getQueryFieldsInfo, getSQLiteReportInfo } from './DBQueryHelper.js';

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

/**
 * Send report category request action
 */
export const SEND_CREATE_RPT_CATEGORY_REQ = 'SEND_CREATE_RPT_CATEGORY_REQ';
export const CONFIRM_RPT_CATEGORY_CREATION = 'CONFIRM_RPT_CATEGORY_CREATION';

export const SEND_DELETE_RPT_CATEGORY_REQ = 'SEND_DELETE_RPT_CATEGORY_REQ';

//Rename report category request
export const SEND_RENAME_RPT_CATEGORY_REQ = 'SEND_RENAME_RPT_CATEGORY_REQ';

//Action that confirms that the category was created
export const CONFIRM_RPT_CATEGORY_DELETION = 'CONFIRM_RPT_CATEGORY_DELETION';

//Confirm the category has been renamed
export const CONFIRM_RPT_CATEGORY_RENAMING = 'CONFIRM_RPT_CATEGORY_RENAMING';

export const NOTIFY_REPORT_CATEGORY_RENAME_ERROR = 'NOTIFY_REPORT_CATEGORY_RENAME_ERROR';

export const NOTIFY_REPORT_CATEGORY_CREATION_ERROR = 'NOTIFY_REPORT_CATEGORY_CREATION_ERROR';

export const REQUEST_REPORT_CATEGORY = 'REQUEST_REPORT_CATEGORY';
export const CONFIRM_REPORT_CATEGORY_RECEIVED = 'CONFIRM_REPORT_CATEGORY_RECEIVED';

/**
 * 
 * @type StringClears the state.edit_cat state
 */
export const CLEAR_EDIT_RPT_CATEGORY = 'CLEAR_EDIT_RPT_CATEGORY';


export const CREATE_RPT_REQUEST_FIELDS = 'CREATE_RPT_REQUEST_FIELDS';
export const CREATE_RPT_RECEIVE_FIELDS = 'CREATE_RPT_RECEIVE_FIELDS';

//Preview error
export const CREATE_RPT_PRVW_ERROR = 'CREATE_RPT_PRVW_ERROR';
export const CREATE_RPT_CLEAR_ERROR = 'CREATE_RPT_CLEAR_ERROR';
export const CREATE_RPT_CLEAR_STATE = 'CREATE_RPT_CLEAR_STATE';

//Signals start of server request
export const CREATE_REPORT_REQUEST = 'CREATE_REPORT_REQUEST';

//Signals end of server request
export const CONFIRM_REPORT_CREATED = 'CONFIRM_REPORT_CREATED';

export const REQUEST_REPORT_DELETION = 'REQUEST_REPORT_DELETION';
export const CONFIRM_REPORT_DELETION = 'CONFIRM_REPORT_DELETION';

//Action necessary to fecth graph data
export const REQUEST_GRAPH_DATA = 'REQUEST_REPORT_DATA'
export const RECEIVE_GRAPH_DATA = 'RECEIVE_REPORT_DATA'

/**
* Error while getting report fields possibly caused by an error in the query or connection
*/
export const NOTIFY_RECEIVE_REPORT_FIELDS_FAILURE = 'NOTIFY_RECEIVE_REPORT_FIELDS_FAILURE' ;

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
		db.all("SELECT t.rowid as id, t.* FROM reports t WHERE t.rowid = ?", [reportId], (err, rows) => {
			if(err !== null){
				log.error(err);
				dispatch(notifyReportRequestError(err.toString()));
				return;
			}
			let reportInfo = rows[0]
			reportInfo.options = JSON.parse(rows[0].options)
			return dispatch(receiveReport(reportId, reportInfo));
			
		});
    }
}


export function notifyReceiveReportFieldsFailure(reportId, error){
    return {
		type: NOTIFY_RECEIVE_REPORT_FIELDS_FAILURE,
		reportId: reportId,
		error: error
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
				return dispatch(notifyReceiveReportFieldsFailure(reportId, "Error occured. See log for detials."));
			}
			
			const hostname = row[0].hostname;
			const port = row[0].port;
			const username = row[0].username;
			const password = row[0].password;
			
			//get report details 
			db.all("SELECT * FROM reports r WHERE rowid = ?",[reportId], (rErr, rRows) => {
				if(rErr !== null){
					log.error(rErr);
					return dispatch(notifyReceiveReportFieldsFailure(reportId, "Error getting report info. See log for detials."));
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
						log.error(`Failed to connect to ${connectionString}. ${err}`);
						return dispatch(notifyReceiveReportFieldsFailure(reportId, "Error occured while connecting to database. See log for detials."));
						//return dispatch(receiveReportFields(reportId, []));
						//@TODO: Create failure notifiation action
						//return dispatch(notifyReceiveReportFieldsFailure(reportId, `Failed to connect to ${url}. ${err}`));
					}
				});
				
			client.query(`SELECT * FROM (${query}) t LIMIT 0`)
				.then( result => {
					let fields = result.fields.map((v,i) => v.name );
					return dispatch(receiveReportFields(reportId, fields));
				} )
				.catch(e => {
					//@TODO: Error notice
					log.error(e);
					return dispatch(notifyReceiveReportFieldsFailure(reportId, "Error occured while executing query. See log for detials."));
					//return dispatch(receiveReportFields(reportId, []));	
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
		return db.all("SELECT \
					r.rowid as id,  \
					r.name as name, \
					c.rowid as cat_id, \
					c.name as cat_name, \
					r.in_built as r_in_built, \
					c.in_built as c_in_built \
				FROM rpt_categories c \
				LEFT join reports r  ON r.category_id = c.rowid		",  (err, rows) => {
					
			if(err !== null){
				log.error(err);
				return dispatch(notifyReportRequestError(err.toString()));
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
						in_built: item.c_in_built,
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
					name: item.name,
					in_built: item.r_in_built
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

export function notifyReportCategoryRenameError(categoryId, error){
    return {
        type: NOTIFY_REPORT_CATEGORY_RENAME_ERROR,
        categoryId: categoryId,
        error: error
    }
}


/**
 * Confirm that the report category rename/edit request has been successful
 * 
 * @param {type} categoryId
 * @returns {confirmReportCategoryRenaming.reports-actionsAnonym$0}
 */
export function confirmReportCategoryRenaming(categoryId){
    return {
        type: CONFIRM_RPT_CATEGORY_RENAMING
    }
}

/**
 * Mark beginning of report category rename request 
 * 
 * @returns {sendRenameReportCategoryRequest.reports-actionsAnonym$1}
 */
export function sendRenameReportCategoryRequest(){
    return {
        type: SEND_RENAME_RPT_CATEGORY_REQ
    }
}


export function clearEditCategoryState(){
    return {
        type: CLEAR_EDIT_RPT_CATEGORY
    }
}


export function sendCreateReportCategoryRequest(){
    return {
        type: SEND_CREATE_RPT_CATEGORY_REQ
    }
}

export function confirmReportCategoryCreation(category){
    return {
        type: CONFIRM_RPT_CATEGORY_CREATION,
        category: category
    }
}

export function sendDeleteReportCategoryRequest(){
    return {
        type: SEND_DELETE_RPT_CATEGORY_REQ
    }
}


//@TODO: Refactor code and combine adding and renameing/editting report 
/**
 * Add a category
 * 
 * @param string catName Category nam e
 * @param string catNotes Notes about the category
 * @param integer catId Category ID
 * @returns {undefined}
 */
export  function saveCategory(catName, catNotes, catId){
    return(dispatch, getState) => {
        dispatch(sendCreateReportCategoryRequest());
        
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.serialize(async () => {
			try{
				//Update if category id not null
				if(catId !== null){

					let stmt = db.prepare(
						"UPDATE rpt_categories SET " +
						" name = ?, notes = ? " +
						" WHERE " + 
						" rowid = ?");
						
					stmt.run([catName, catNotes, catId], async function(err){
						if(err !== null){
							log.error(err.toString())
							return dispatch(notifyReportCategoryCreationError('Error updating report. Check log for details'));
						}
						
						const data = {
							name: catName,
							id: catId,
							notes: catNotes
						}
						//Update the report tree incase the report name changed
						await dispatch(getReports());
						return dispatch(confirmReportCategoryCreation());
					});

				}else{
					let stmt = db.prepare(
						"INSERT INTO rpt_categories " +
						" (name, notes, parent_id)" +
						" VALUES " + 
						"(?,?,0)"
					);

					stmt.run([catName, catNotes], (err) => {
						if(err !== null){
							log.error(err.toString())
							return dispatch(notifyReportCategoryCreationError('Error inserting category. Check log for details'));
						}
						
					
						dispatch(getReports());
						return dispatch(confirmReportCategoryCreation());
					});
					stmt.finalize();

					
				}

			}catch(e){
				return dispatch(notifyReportCategoryCreationError('Error during category creation.'));
			}
		});
    }
}

export function notifyReportCategoryCreationError(error){
    return {
        type: NOTIFY_REPORT_CATEGORY_CREATION_ERROR,
        error: error
    }
}


export function sendDeleteCategoryRequest(){
    return {
        type: SEND_DELETE_RPT_CATEGORY_REQ
    }
}

/**
 * Remove a category
 * 
 * @returns {Function}* 
 */
export function removeCategory(catId){
    return(dispatch, getState) => {
        dispatch(sendDeleteCategoryRequest());
        
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.serialize(() => {
			try{
				db.run("DELETE FROM rpt_categories WHERE rowid = ? ", catId, (err) => {
					if(err !== null){
						log.error(err.toString());
						return dispatch(notifyReportCategoryCreationError('Error during category creation.'));
					}
					
					return dispatch(notifyReportCategoryCreationError("Error while deleting category."));
				});
				
				dispatch(getReports());
				return dispatch(confirmReportCategoryDeletion({}));
			}catch(e){
				return dispatch(notifyReportCategoryCreationError('Error during category creation.'));
			}
		});
    }
}


export function confirmReportCategoryDeletion(){
    return {
        type: CONFIRM_RPT_CATEGORY_DELETION
    }
}

/**
 * This marks the beginning of the report category details request
 * 
 * @param {type} categoryId
 * @returns {requestReportCategory.reports-actionsAnonym$39}
 */
export function requestReportCategory(categoryId){
    return {
        type: REQUEST_REPORT_CATEGORY,
        categoryId: categoryId
    }
}


/**
 * Confirm that the report category details have been received from the api call
 * 
 * @param {type} categoryId
 * @param {type} data
 * @returns {confirmReportCategoryReceived.reports-actionsAnonym$40}
 */
export function confirmReportCategoryReceived(categoryId, data){
    return {
        type: CONFIRM_REPORT_CATEGORY_RECEIVED,
        categoryId: categoryId,
        data: data
    }
}

/**
 * Get report category details when editing
 * 
 * @param {type} categoryId
 * @returns {Function}
 */
export function getCategory(categoryId){
    return(dispatch, getState) => {
        dispatch(requestReportCategory(categoryId))
        
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.all("SELECT * FROM rpt_categories WHERE rowid = ? ", categoryId, (err, rows ) => {
			if(err !== null){
				log.error(err.toString());
				return dispatch(notifyReportCategoryCreationError('Error occured while getting category.'));
			}
			
			return dispatch(confirmReportCategoryReceived(categoryId, rows[0]));
			
		});
    }
}


export function clearReportCreateState(){
    return {
        type: CREATE_RPT_CLEAR_STATE
    }
}


export function clearPreviewReportError(){
    return {
        type: CREATE_RPT_CLEAR_ERROR
    }
}


export function confirmReportCreation(reportId, reportInfo){
    return { type: CONFIRM_REPORT_CREATED,
        reportId: reportId,
        reportInfo: reportInfo
    };
}

export function createOrUpdateReport({name, category_id, notes, qry, reportId, options}){
   return (dispatch, getState) => {
        dispatch(createReportRequest());

		const reportType = typeof options.type === 'undefined' ? 'Table': options.type;

		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.serialize(async () => {
			try{

				//Update if reportId not null
				if(reportId !== null){
					let stmt = db.prepare(
						"UPDATE reports SET " +
						" name = ?, notes = ?, category_id = ?, query = ?, options = ?, type = ?" +
						" WHERE " + 
						" rowid = ?");
						
					stmt.run([name, notes, category_id, qry, JSON.stringify(options), reportType, reportId], async function(err){
						if(err !== null){
							log.error(err.toString())
							return dispatch(createReportPreviewError('Error updating report. Check log for details'));
						}
						
						const data = {
							name: name,
							category_id: category_id,
							notes: notes,
							query: qry,
							options: options,
							id: reportId
						}
						//Update the report tree incase the report name changed
						await dispatch(getReports());
						return dispatch(confirmReportCreation(reportId, data));
					});

				}else{
				
					//Insert/create new report
					let stmt = db.prepare(
						"INSERT INTO reports " +
						" (name, notes, category_id, query, options, type)" +
						" VALUES " + 
						"(?,?,?,?,?,?)"
					);
					
		
					stmt.run([name, notes, category_id, qry, JSON.stringify(options), reportType], async function(err){
						if(err !== null){
							log.error(err.toString())
							return dispatch(createReportPreviewError('Error creating report. Check log for details'));
						}
						
						const reportId = this.lastID;
						const data = {
							name: name,
							category_id: category_id,
							notes: notes,
							query: qry,
							options: options
						}
						//Update the report tree incase the report name changed
						await dispatch(getReports());
						
						return dispatch(confirmReportCreation(reportId, data));
						
					});
					stmt.finalize();
					
				}



				
			}catch(e){
				return dispatch(createReportPreviewError('Error during category creation.'));
			}
		});
        
    }
}

/**
 * reportId  is used when the error is during and edit of the report.
 * 
 * @param {type} error
 * @param {type} reportId ID of the report being editted.
 * @returns {createReportPreviewError.reports-actionsAnonym$9}
 */
export function createReportPreviewError(error, reportId){
    return {
        type: CREATE_RPT_PRVW_ERROR,
        error: error,
        reportId: reportId
    }
}

/**
 * Get fields during report creation
 * @param {type} name
 * @returns {requestCreateReportFields.reports-actionsAnonym$7}
 */
export function createReportFields(name,qry, options){
    return {
        type: CREATE_RPT_REQUEST_FIELDS,
        name: name,
        qry: qry,
        options: options
    };

}

export function requestCreateReportFields(name,qry, options){
    return async (dispatch, getState) => {
        dispatch(createReportFields(name,qry, options));

		const fieldsInfo = await getQueryFieldsInfo(qry);
		if( typeof fieldsInfo.error !== 'undefined'){
			return dispatch(createReportPreviewError(fieldsInfo.error.toString()));
		}
		const fields = fieldsInfo.map((v,i) => v.name );
		return dispatch(receiveCreateReportFields(fields));
    }
}

export function createReportRequest(){
    return {
        type: CREATE_REPORT_REQUEST
    }
}

export function receiveCreateReportFields(fields){
    return {
        type: CREATE_RPT_RECEIVE_FIELDS,
        fields: fields
    }
}

export function requestReportDeletion(reportId){
    return {
        type: REQUEST_REPORT_DELETION,
        reportId: reportId
    }
}

export function confirmReportDeletion(reportId){
    return {
        type: CONFIRM_REPORT_DELETION,
        reportId: reportId
    }
}



export function deleteReport(reportId){
    return (dispatch, getState) => {
        dispatch(requestReportDeletion());
       
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.serialize(() => {
			try{
				db.run("DELETE FROM reports WHERE rowid = ? ", reportId, (err) => {
					if(err !== null){
						log.error(err.toString());
						return dispatch(notifyReportCategoryCreationError('Error during category creation.'));
					}
					
					return dispatch(confirmReportDeletion("Report successfully deleted."));
				});
				
				dispatch(getReports());
			}catch(e){
				log.error(e.toString());
				return dispatch(notifyReportCategoryCreationError('Error during category creation.'));
			}
		});
    }
}

/**
 * Request data for a graph report type.
 * 
 * @param int reportId
 */
export function requestGraphData(reportId){
    return {
        type: REQUEST_GRAPH_DATA
    }
}

/**
 * Receive graph report data
 * 
 * @param int reportId
  * @param Array reportData
 */
export function receiveGraphData(reportId, reportData){
    return {
        type: RECEIVE_GRAPH_DATA,
        reportData: reportData,
        reportId: reportId
    }
}

export function getGraphData(reportId){
    return(dispatch, getState) => {
        dispatch(requestGraphData(reportId))
        
		let db = new sqlite3.Database(SQLITE3_DB_PATH);
		db.all("SELECT * FROM reports WHERE rowid = ? ", reportId, async (err, rows ) => {
			if(err !== null){
				log.error(err.toString());
				return dispatch(notifyReceiveReportFieldsFailure(reportId, "Error occured. See log for detials."));
			}
			
			const query = rows[0].query;
			try{
				const results = await runQuery(query);
				return dispatch(receiveGraphData(reportId, results.rows));
			}catch(err2){
				log.error(err2);
				return dispatch(notifyReceiveReportFieldsFailure(reportId, "Error occured. See log for detials."));
			}

			
		});
        
    }
}