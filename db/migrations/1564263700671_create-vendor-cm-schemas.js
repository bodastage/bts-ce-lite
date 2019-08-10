exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.createSchema("ericsson_cm", {ifNotExists : true} );
	pgm.createSchema("huawei_cm", {ifNotExists : true} );
	pgm.createSchema("zte_cm", {ifNotExists : true} );
	pgm.createSchema("nokia_cm", {ifNotExists : true} );
};

exports.down = (pgm) => {
	pgm.dropSchema("ericsson_cm", {ifExists : true} );
	pgm.dropSchema("huawei_cm", {ifExists : true} );
	pgm.dropSchema("zte_cm", {ifExists : true} );
	pgm.dropSchema("nokia_cm", {ifExists : true} );
};
