import { REQUEST_REPORTS, REQUEST_REPORT_FIELDS, RECEIVE_REPORTS,
		RECEIVE_REPORT, RECEIVE_REPORT_FIELDS } from './reports-actions';

let initialState = {
    
    //Used by the reports tree
    requestingReports: false,
    requestError: null,
    reports: [],
    
    //Report tree filtering state
    filter:{
        text: '',
        reports: true,
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
            default:
                return state;
		}
}

