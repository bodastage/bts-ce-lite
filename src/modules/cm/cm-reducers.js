import { SAVE_CM_PARSING_FOLDERS } from './cm-actions';


let initialState = {
	"parse_cm": {"inputFolder": null, "outputFolder": null}
};


export default function cm(state = initialState, action) {
	
	    switch (action.type) {
			
			case SAVE_CM_PARSING_FOLDERS:
				return {
						...state, 
						parse_cm: {
							...state.parse_cm, 
							"inputFolder": action.inputFolder,
							"outputFolder": action.outputFolder
						}
					}
			
			default:
				return state;
		}
}