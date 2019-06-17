import { SAVE_CM_PARSING_FOLDERS, UPDATE_PROCESS_CM_TIMER } from './cm-actions';


let initialState = {
	"parse_cm": {"inputFolder": null, "outputFolder": null, timerValue: "00:00:00"}
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
			case UPDATE_PROCESS_CM_TIMER:
				return {
					...state,
					parse_cm: {
						...state.parse_cm,
						"timerValue": action.timerValue
					}
				}
			default:
				return state;
		}
}