exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.createSchema("motorola_cm", {ifNotExists : true} );
	
	pgm.createTable({schema: "motorola_cm", name: "cell_x_export"}, {id: "id", load_datetime: "load_datetime", data: "data"});
};

exports.down = (pgm) => {
	pgm.dropTable({schema: "motorola_cm", name: "cell_x_export"});
	
	pgm.dropSchema("motorola_cm", {ifExists : true} );
};
