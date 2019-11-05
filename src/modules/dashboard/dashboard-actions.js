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
		var spawn = window.require('child_process').spawn('java', ['-version']);
		spawn.on('error', function(err){
			//return callback(err, null);
			log.error(err);
		})
		
		spawn.stdout.on('data', function(data) {
			console.log("spawn.stdout.on:", data);
		});
		
		spawn.stderr.on('data', function(data) {
			
			//Check if java is in string data
			var javaCheck = new RegExp('java', 'i').test(data);
			
			//
			data = data.toString().split('\n')[0];
			var javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;

			if (javaCheck != false) {
				// TODO: We have Java installed
				dispatch(clearNotice());
				
			} else {
				log.error("Java cannot be detected on your system. It is required by the application. Download Java from https://www.java.com/en/download");
				dispatch(addDashboardNotice({
					message: "Java cannot be detected on your system. It is required by the application. Download Java from https://www.java.com/en/download",
					type: 'danger'
				}))
				//@TODO: No Java installed
			}
		});
        
    }
}