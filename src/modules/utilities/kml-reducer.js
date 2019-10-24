import {
	KML_SAVE_FILE_HEADERS,
	KML_EXTRACTING_HEADERS
} from './kml-actions';

let initialState = {
	
	//file headers
	headers: [],
	
	//processing
	processing: false,
	
	config: {
		dataFile: null,
		configFile: null,
		data: [{
			folders: [
				{
					name: "Folder 1", 
					description: 'Folder 1',
					expType: 'field', //field|expression
					expression: 'Cells'
				}
			]
		}]
	}
};


export default function kml(state = initialState, action){
	switch (action.type) {
		case KML_SAVE_FILE_HEADERS:
			return {
				...state,
				headers: action.headers,
				processing: false
			};
		case KML_EXTRACTING_HEADERS:
			return {
				...state,
				processing: true
			}
		default:
			return state;
	}
}