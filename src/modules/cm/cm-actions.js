export const SAVE_CM_PARSING_FOLDERS = 'SAVE_CM_PARSING_FOLDERS';


/**
* Save the input and output folder used during the last parsing session
*
* @param string inputFolder 
* @param string outputFolder 
*/
export function saveCMParsingFolders(inputFolder, outputFolder){
    return {
        type: SAVE_CM_PARSING_FOLDERS,
		inputFolder: inputFolder,
		outputFolder: outputFolder
    };
}
