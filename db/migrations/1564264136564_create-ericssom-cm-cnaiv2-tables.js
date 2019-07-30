exports.up = (pgm) => {
	pgm.createTable({schema: "ericsson_cm", name: "UTRAN_NREL"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "UTRAN_EXTERNAL_CELL"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "TG"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "SITE"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "PRIORITY_PROFILE"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "OVERLAID_CELL"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "OUTER_CELL"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "NREL"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "MSC"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "INTERNAL_CELL"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "INNER_CELL"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "EXTERNAL_CELL"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "CHANNEL_GROUP"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "ericsson_cm", name: "BSC"}, {id: "id", load_datetime: "load_datetime", data: "data"});
};

exports.down = (pgm) => {
    pgm.dropTable({schema: "ericsson_cm", name: 'UTRAN_NREL'});
    pgm.dropTable({schema: "ericsson_cm", name: 'UTRAN_EXTERNAL_CELL'});
    pgm.dropTable({schema: "ericsson_cm", name: 'TG'});
    pgm.dropTable({schema: "ericsson_cm", name: 'SITE'});
    pgm.dropTable({schema: "ericsson_cm", name: 'PRIORITY_PROFILE'});
    pgm.dropTable({schema: "ericsson_cm", name: 'OVERLAID_CELL'});
    pgm.dropTable({schema: "ericsson_cm", name: 'OUTER_CELL'});
    pgm.dropTable({schema: "ericsson_cm", name: 'NREL'});
    pgm.dropTable({schema: "ericsson_cm", name: 'MSC'});
    pgm.dropTable({schema: "ericsson_cm", name: 'INTERNAL_CELL'});
    pgm.dropTable({schema: "ericsson_cm", name: 'INNER_CELL'});
    pgm.dropTable({schema: "ericsson_cm", name: 'EXTERNAL_CELL'});
    pgm.dropTable({schema: "ericsson_cm", name: 'CHANNEL_GROUP'});
    pgm.dropTable({schema: "ericsson_cm", name: 'BSC'});
};
