const log = window.require('electron-log');

export const DASHBOARD_ADD_NOTICE = 'DASHBOARD_ADD_NOTICE';

export const DASHBOARD_CLEAR_NOTICE = 'DASHBOARD_CLEAR_NOTICE';


export function clearNotice(){
	return {
		type: DASHBOARD_CLEAR_NOTICE
	};
}

export function addDashboardNotice(notice){
	return {
		type: DASHBOARD_ADD_NOTICE,
		notice: notice
	};
}

/*
* Check if is installed
*/
export function checkIfJavaIsInstalled(){
    return (dispatch, getState) => {
		var spawn = window.require('child_process').spawn('javaD', ['-version']);
		spawn.on('error', function(err){
			//return callback(err, null);
			log.error(err);
			log.error("Java cannot be detected on your system. It is required by the application. Download Java from https://www.java.com/en/download",);
			dispatch(addDashboardNotice({
				message: "Java cannot be detected on your system. It is required by the application. Download Java from https://www.java.com/en/download",
				type: 'danger'
			}))
		})
		
		spawn.stderr.on('data', function(data) {
			console.log("spawn.stderr.on('data', function(data) {");
			data = data.toString().split('\n')[0];
			var javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
			if (javaVersion != false) {
				// TODO: We have Java installed
				//return callback(null, javaVersion);
				
			} else {
				log.error("Java cannot be detected on your system. It is required by the application. Download Java from https://www.java.com/en/download",);
				dispatch(addDashboardNotice({
					message: "Java is not installed or not in the system path!",
					type: 'danger'
				}))
				// TODO: No Java installed

			}
		});
        
    }
}