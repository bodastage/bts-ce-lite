exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.createTable({schema: "ericsson_cm", name: "invBSM"}, {id: "id", load_datetime: "load_datetime", data: "data"});
};

exports.down = (pgm) => {
	pgm.dropTable({schema: "ericsson_cm", name: 'invBSM'});
};
