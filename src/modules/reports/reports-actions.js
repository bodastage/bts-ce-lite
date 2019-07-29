import { runQuery, getQueryFieldsInfo } from './DBQueryHelper.js';
const log = window.require('electron-log');


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

//Clear new category state i.e reports.newCat
export const CLEAR_NEW_RPT_CATEGORY = 'CLEAR_NEW_RPT_CATEGORY';


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

/*
*Add a report to the composite report
*/
export const ADD_TO_COMPOSITE_REPORT = 'ADD_TO_COMPOSITE_REPORT';

//Uupdate composite report during report creation 
export const UPDATE_COMPOSITE_REPORT_LAYOUT = 'UPDATE_COMPOSITE_REPORT_LAYOUT';

//Clear the state used to create and edit a composite report 
export const CLEAR_CREATE_COMP_RPT_STATE  = 'CLEAR_CREATE_COMP_RPT_STATE';

//Load composite report info for editting 
export const LOAD_COMP_RPT_INFO_FOR_EDIT = 'LOAD_REPORT_INFO_FOR_EDIT';

//Confirm composite report is created
export const CONFIRM_COMP_RPT_CREATION = 'CONFIRM_COMP_RPT_CREATION';

export function loadCompReportInfoForEdit(reportId){
	return {
		type: LOAD_COMP_RPT_INFO_FOR_EDIT,
		reportId: reportId
	}
}

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
    return async (dispatch, getState) => {
        dispatch(requestReport(reportId));
		const query = `SELECT t.* FROM reports.reports t WHERE t.id = ${reportId}`;
		const results = await runQuery(query);

		if(typeof results.error !== 'undefined'){
			log.error(results.error);
			dispatch(notifyReportRequestError(results.error));
			return;
		}
		
		let reportInfo = results.rows[0]
		dispatch(receiveReport(reportId, reportInfo));
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
    return  async(dispatch, getState) => {
        dispatch(requestReportFields(reportId));
		
		//@TODO: only select query
		const query = `SELECT * FROM reports.reports r WHERE r.id =${reportId}`;
		const results = await runQuery(query);
		
		//@TODO: Handle connection error 
		
		let query2 = results.rows[0].query;
		
		const results2 = await runQuery(`SELECT * FROM (${query2}) t LIMIT 0`);
		//@TODO: Check for connection error and 
		if(typeof results2.error !== 'undefined'){
			log.error(results2.error);
			return dispatch(notifyReceiveReportFieldsFailure(reportId, "Error occured while getting reports fileds. See log for detials."));
		}
		
		let fields = results2.fields.map((v,i) => v.name );
		return dispatch(receiveReportFields(reportId, fields));

    }
}

export function getReports(){
    return async (dispatch, getState) => {
        dispatch(requestReports());
	
		const query = `SELECT 
					r.id as id,  
					r.name as name, 
					r.type as type, 
					c.id as cat_id, 
					c.name as cat_name, 
					r.in_built as r_in_built, 
					c.in_built as c_in_built 
				FROM reports.categories c 
				LEFT join reports.reports r  ON r.category_id = c.id`;
			
		const results = await runQuery(query);
		if(typeof results.error !== 'undefined'){
			log.error(results.error);
			return dispatch(notifyReportRequestError(results.error));
		}
		
		/*
		* Holds an list/array of categories and  for each category there is an list/array of reports
		*/
		let reports = [];
		let catIndexMap = {}; //Map of category names to ids
		
		results.rows.forEach((item, index) => {
			
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
				in_built: item.r_in_built,
				type: item.type
			})
		});
		
		dispatch(receiveReports(reports));
			
    }
}


//@TODO: Remove if not being used
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

export function clearNewCategoryState(){
    return {
        type: CLEAR_NEW_RPT_CATEGORY
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
    return async ( dispatch, getState) => {
        dispatch(sendCreateReportCategoryRequest());
		
		try{
			//Update if category id not null
			if(catId !== null){

				let qry = `
					UPDATE reports.categories t SET 
					name = $$${catName}$$, notes = $$${catNotes}$$
					WHERE
					id = ${catId}`;
				const result = await runQuery(qry);
				if(typeof result.error !== 'undefined'){
					log.error(result.error)
					return dispatch(notifyReportCategoryCreationError('Error updating report. Check log for details'));
				}

			}else{
				let qry = `
					INSERT INTO reports.categories 
					 (name, notes, parent_id)
					 VALUES
					($$${catName}$$, $$${catNotes}$$,0)
					`;

				const result = await runQuery(qry);
				if(typeof result.error !== 'undefined'){
					log.error(result.error)
					return dispatch(notifyReportCategoryCreationError('Error inserting category. Check log for details'));
				}
			}			

			//Update the report tree incase the report name changed
			dispatch(getReports());
			return dispatch(confirmReportCategoryCreation());

		}catch(e){
			return dispatch(notifyReportCategoryCreationError('Error during category saving.'));
		}
		
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
    return async (dispatch, getState) => {
        dispatch(sendDeleteCategoryRequest());
        		
		try{
			const query = `DELETE FROM reports.categories WHERE id = ${catId}`;
			const results = await runQuery(query);
			
			if(typeof results.error !== 'undefined'){
				log.error(results.error);
				return dispatch(notifyReportCategoryCreationError("Error while deleting category."));
			}
			
			dispatch(getReports());
			return dispatch(confirmReportCategoryDeletion({}));
		}catch(e){
			return dispatch(notifyReportCategoryCreationError('Error during category deletion.'));
		}
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
    return async (dispatch, getState) => {
        dispatch(requestReportCategory(categoryId))
        
		const query = `SELECT * FROM reports.categories c WHERE id = ${categoryId} `;
		const results = await runQuery(query);
		//@TODO: Check result status
		
		if(typeof results.error !== 'undefined'){
			log.error(results.error);
			return dispatch(notifyReportCategoryCreationError('Error occured while getting category.'));
		}
		
		return dispatch(confirmReportCategoryReceived(categoryId, results.rows[0]));

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
   return async (dispatch, getState) => {
        dispatch(createReportRequest());

		const reportType = typeof options.type === 'undefined' ? 'Table': options.type;

			try{

			//Update if reportId not null
			if(reportId !== null){
				let query = `
					UPDATE reports.reports SET 
					name = $$${name}$$, 
					notes = $$${notes}$$, 
					category_id = ${category_id}, 
					query = $$${qry}$$, 
					options = $$${JSON.stringify(options)}$$, 
					type = '${reportType}' 
					WHERE " + 
					id = ${reportId}`;
					
				const results = await runQuery(query);

				if(typeof results.error !== 'undefined'){
					log.error(results.error)
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
				dispatch(getReports());
				return dispatch(confirmReportCreation(reportId, data));

			}else{
			
				//Insert/create new report
				let query = `
					INSERT INTO reports.reports
					(name, notes, category_id, query, options, type)
					VALUES
					($$${name}$$, $$${notes}$$, ${category_id}, $$${qry}$$, $$${JSON.stringify(options)}$$, '${reportType}')
					RETURNING id;
				`;
				
				console.log(qry);
				const results = await runQuery(query);
				
				console.log("+++++++++++++++++++++++++++++");
				console.log(results);

				if(typeof results.error !== 'undefined'){
					log.error(results.error)
					return dispatch(createReportPreviewError('Error updating report. Check log for details'));
				}
	
					
				const reportId = results.rows[0].id;
				const data = {
					name: name,
					category_id: category_id,
					notes: notes,
					query: qry,
					options: options
				}
				//Update the report tree incase the report name changed
				dispatch(getReports());
				
				return dispatch(confirmReportCreation(reportId, data));

			}

		}catch(e){
			return dispatch(createReportPreviewError('Report creationg error. ' + e.toString()));
		}
        
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
    return async (dispatch, getState) => {
        dispatch(requestReportDeletion());

		try{
			const query = `DELETE FROM reports.reports WHERE id =  ${reportId}`;
			const results = await runQuery(query);
			
			if(typeof results.error !== 'undefined'){
				log.error(results.error);
				dispatch(notifyReportRequestError(results.error));
				return;
			}
			
			dispatch(confirmReportDeletion("Report successfully deleted."));
			
			dispatch(getReports());
		}catch(e){
			log.error(e.toString());
			return dispatch(notifyReportRequestError('Error during report creation.'));
		}
		
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
    return async (dispatch, getState) => {
        dispatch(requestGraphData(reportId))
        
		const query = `SELECT t.* FROM reports.reports t WHERE t.id = ${reportId}`;
		const qResults = await runQuery(query);

		const rptQry = qResults.rows[0].query;
		
		if(typeof qResults.error !== 'undefined'){
			log.error(qResults.error);
			
			//@TODO: Confirm that this is not the correct notify action
			dispatch(notifyReportRequestError(qResults.error));
			return;
		}
		
		try{
			const results = await runQuery(rptQry);
			return dispatch(receiveGraphData(reportId, results.rows));
		}catch(err2){
			log.error(err2);
			//@TODO: Confirm that this is not the correct notify action
			return dispatch(notifyReceiveReportFieldsFailure(reportId, "Error occured. See log for detials."));
		}
    }
}

/**
* Add report to composite report
*
* @param integer compReportId
* @param integer reportId
* @param object options layout
*/
export function addToCompositeReport(compReportId, reportId, options ){
	if(typeof compReportId !== 'number') compReportId = null;
	
	//@TODO: Insert into db and report compReportId
	const key = `a${compReportId||"999"}`
	
	return {
		type: ADD_TO_COMPOSITE_REPORT,
		compReportId: compReportId,
		reportId: reportId,
		options: { ...options, key: key}
	}
}

/**
* Update during report creation 
*/
export function updateCompositeLayout(layout){
	
	//@TODO: Update in te
	return {
		type: UPDATE_COMPOSITE_REPORT_LAYOUT,
		layout: layout
	}
}

export function saveCompositeReport(reportId, name, catId, options){
	return async (dispatch, getState) => {
		//@TODO: action notifying start of saving 
		
		const opts = {...options, type: 'Composite'}
		
		try{
			//Update if reportId not null
			if(reportId !== null){
				let qry = `
					UPDATE reports.reports SET " +
					 name = $$${name}$$, 
					 notes = '', 
					 category_id = ${catId}, 
					 options = $$${JSON.stringify(opts)}$$
					 type = 'composite',
					 query = ''
					 WHERE  
					 id = ${reportId}`;
					
				const results = await runQuery(qry);
				if(typeof results.error !== 'undefined'){
					log.error(results.error);
					//return dispatch(createReportPreviewError('Error updating report. Check log for details'));
					return;
				}
				
				const reportInfo = getState().reports.reportsInfo[reportId]
				const data = {
					...reportInfo,
					name: name,
					category_id: catId,
					options: options
				};
				
				//Update the report tree incase the report name changed
				dispatch(getReportInfo(reportId));
				dispatch(getReports());
				dispatch(confirmCompReportCreation(reportId, data));

			}else{
				//Insert/create new report
				let qry = `
					INSERT INTO reports.reports 
					(name, notes, category_id, query, options, type) 
					VALUES 
					($$${name}$$, '', ${catId}, '', $$${JSON.stringify(opts)}$$, 'composite')
					RETURNING id
				`;
				
				const results = await runQuery(qry);
				if(typeof results.error !== 'undefined'){
					log.error(results.error);
					//return dispatch(createReportPreviewError('Error updating report. Check log for details'));
					return;
				}
				
				//Update the report tree incase the report name changed
				dispatch(getReports());

			}
		}catch(e){
			
		}
	}
}

/**
* Clear the state of the create composite report 
*
*/
export function clearCreateCompReportState(){
    return {
        type: CLEAR_CREATE_COMP_RPT_STATE
    }
}


/**
* Get composite report info and load in state.compReport
*/
export function getCompReportInfoForEdit(reportId){
	return (dispatch, getState) => {
		dispatch(getReportInfo(reportId));
		
		//This should be called after call to getReportINfo has completed
		//dispatch(loadCompReportInfoForEdit(reportId))
	}	
}

export function confirmCompReportCreation(reportId, data){
	return {
		type: CONFIRM_COMP_RPT_CREATION,
		data: data,
		reportId: reportId
	};
}