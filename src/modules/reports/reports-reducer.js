import { REQUEST_REPORTS, REQUEST_REPORT_FIELDS, RECEIVE_REPORTS,
		RECEIVE_REPORT, RECEIVE_REPORT_FIELDS, SEND_CREATE_RPT_CATEGORY_REQ,
		CONFIRM_RPT_CATEGORY_CREATION, SEND_DELETE_RPT_CATEGORY_REQ, CONFIRM_RPT_CATEGORY_DELETION,
		NOTIFY_REPORT_CATEGORY_CREATION_ERROR, CREATE_RPT_RECEIVE_FIELDS, CONFIRM_REPORT_CREATED,
		CREATE_RPT_PRVW_ERROR, RECEIVE_GRAPH_DATA
		} from './reports-actions';

let initialState = {
    
    //Used by the reports tree
    requestingReports: false,
    requestError: null,
    reports: [],
    
    //Report tree filtering state
    filter:{
        text: '',
        reports: false,
        categories: false
    },
    
    //Contains all report related data
    //while it is being rendered
    reportsdata:{},
    
    //Meta data about a report when being displayed
	/*
	* {
	'reportId':{
		category_id: integer_value,
		error: null,
		id: integer_value, //report id 
		name: stringValue, //report name 
		notes: stringValue, //reports notes 
		query: stringValue, //report query 
		type: table|pie|bar|scatter|compound, // report type
		options: { //
			data: {}, //Ploty data options for charts 
			layout: {}, //Plotly layout options for charts 
			type: table|chart, //table|chart . From the old api
			}
		
		}
	}
	*/
    reportsInfo:{},
	
    //Contains all report creation related data
    create: {
        error: null,
        fields: [],
        creating: false // for showing a loading indicator when request is sent to the server
    },
	
     //Stores the sate of new category creation
    newCat:{},
    
    editCat: null // edit category details her
};


export default function reports(state = initialState, action){
        switch (action.type) {
            case REQUEST_REPORTS:
				return {...state, requestingReports: true}
            case REQUEST_REPORT_FIELDS:
                if( typeof state.reportsdata[action.reportId]=== 'undefined' ){
					return {
						...state, 
						reportsdata: {
							...state.reportsdata,
							[action.reportId]: {
								requesting: true,
								requestError:  null,
								fields: [],
								download: null
							}
						}
					
					}
                }
				
				return {
					...state,
					reportsdata: {
						...state.reportsdata,
						[action.reportId]: {
							requesting: true,
							requestError:  null,
							fields: state.reportsdata[action.reportId].fields,
							download: state.reportsdata[action.reportId].download,
						}
					}
				}
            case RECEIVE_REPORTS:
                return {
					...state,
                    requestingReports: false,
                    requestError: null,
                    reports: action.reports
                };
            case RECEIVE_REPORT:
                return {
                    ...state,
                    reportsInfo: {
                        ...state.reportsInfo, 
                        [action.reportId]: {...action.reportInfo, error: null}
                    }
                }
            case RECEIVE_REPORT_FIELDS:
                return Object.assign({}, state, { 
                        reportsdata: Object.assign({},state.reportsdata, {
                            [action.reportId]: {
                                requesting: false,
                                requestError:  null,
                                fields: action.fields,
                                download: null
                            }
                        })
                    });
            case SEND_CREATE_RPT_CATEGORY_REQ:
                return {
                    ...state,
                    newCat: { ...state.newCat, requesting: true}
                }
            case CONFIRM_RPT_CATEGORY_CREATION:
                return {
                    ...state,
                    newCat: { ...state.newCat, requesting: false}
                }
            case SEND_DELETE_RPT_CATEGORY_REQ:
                return {
                    ...state,
                    requestingReports: true
                }
            case CONFIRM_RPT_CATEGORY_DELETION:
                return {
                    ...state,
                    requestingReports: false
                }
            case NOTIFY_REPORT_CATEGORY_CREATION_ERROR:
                return {
                    ...state,
                    requestingReports: false,
                    requestError: action.error
                }
            case CREATE_RPT_RECEIVE_FIELDS:
                return {
                    ...state,
                    create: { ...state.create, fields: action.fields, error: null}
                }
            case CONFIRM_REPORT_CREATED:
                return {
                    ...state,
                    create: { 
                        ...state.create,
                        //fields: [], //Don't reset fields after saving.
                        error: null, 
                        creating: false
                    },
                    reportsInfo: {
                        ...state.reportsInfo,
                        [action.reportId]: {
                            ...action.reportInfo, 
                            id: action.reportId 
                        }       
                    }
                }
            case CREATE_RPT_PRVW_ERROR:
                return {
                    ...state,
                    create: { ...state.create, error: action.error, fields:[], creating: false}
                }
            case RECEIVE_GRAPH_DATA:
                return {
                    ...state,
                    reportsdata: { 
                            ...state.reportsdata,
                        [action.reportId]: {
                            requesting: false,
                            requestError:  null,
                            fields: [],
                            download: null,
                            data: action.reportData
                        }
                    }
                }
            default:
                return state;
		}
}

