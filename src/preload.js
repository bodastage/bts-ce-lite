
const { contextBridge, ipcRenderer } = require('electron');
const sqlite3 = require('sqlite3').verbose()

function clearSQLiteDB(){
    var stats = fs.statSync(SQLITE3_DB_PATH);
			
    if(fs.existsSync(SQLITE3_DB_PATH) && stats.size === 0 ){
        fs.unlinkSync(SQLITE3_DB_PATH);
        log.info(`Deleting boda-lite.sqlite3 because it's size is 0`);
    }
}

function attemptAuthentication(loginDetails){
    let db = new sqlite3.Database(SQLITE3_DB_PATH);
    db.all("SELECT * FROM users WHERE email = ? AND password = ?", 
        [loginDetails.username, loginDetails.password] , (err, row) => {
            if(err !== null){
               // dispatch(markLoginAsFailed(err.toString()));
                return;
            }
            
            if(row.length > 0){
                dispatch(logIntoApp({
                    first_name: row[0].first_name, 
                    username: row[0].email, 
                    email: row[0].email, 
                    other_names: row[0].other_names, 
                    last_name: row[0].last_name}));
            }else{
                dispatch(markLoginAsFailed("Wrong email and password! Try again."));
            }
            
    });
}


contextBridge.exposeInMainWorld('BodaAPI', {
    clearSQLiteDB: clearSQLiteDB,
    attemptAuthentication: attemptAuthentication,
    fs: require('fs'),
    path: require('path'),
});