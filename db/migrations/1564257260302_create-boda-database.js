//require without window to run migrations on the cli
//DATABASE_URL=postgres://bodastage:password@localhost:5432/boda yarn run migrate up -m db/migrations/

const PgLiteral = typeof window !== 'undefined' ? window.require('node-pg-migrate').PgLiteral : require('node-pg-migrate').PgLiteral;

exports.shorthands = {
		idx: { type: 'uuid', primaryKey: true},
		load_datetime: { 
			type: "timestamp", 
			notNull: true, 
			default: new PgLiteral('current_timestamp')
		},
		data: {type: "jsonb", notNull: true},
		createdAt: { 
			type: "timestamp", 
			notNull: true, 
			default: new PgLiteral('current_timestamp')
		},
		createdBy: { 
			type: "integer", 
			notNull: true, 
			default: 0
		}
};

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
	
	
	pgm.sql("CREATE EXTENSION IF NOT EXISTS  tablefunc");
};

exports.down = (pgm) => {
//	pgm.noTransaction();
//	pgm.sql("DROP DATABASE IF EXISTS boda");
// 	pgm.dropRole("bodastage");

	pgm.sql("DROP EXTENSION IF EXISTS tablefunc");

};
