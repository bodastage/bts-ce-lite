exports.shorthands = undefined;

//@TODO: Run these migrations from postgres account separately
exports.up = (pgm) => {
//	pgm.noTransaction();
//	pgm.sql("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = 'boda';");
//	pgm.sql("DROP DATABASE IF EXISTS boda");
//	
// 	pgm.createRole( "bodastage", {
// 		"password": "password",
// 		"login": true
// 	} );
//	
//	pgm.sql( "CREATE DATABASE boda owner bodastage");
	
};

exports.down = (pgm) => {
//	pgm.noTransaction();
//	pgm.sql("DROP DATABASE IF EXISTS boda");
// 	pgm.dropRole("bodastage");

};
