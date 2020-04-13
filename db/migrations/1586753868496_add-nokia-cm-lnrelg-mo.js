exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.createTable({schema: "nokia_cm", name: "LNRELG"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "nokia_cm", name: "TOP"}, {id: "id", load_datetime: "load_datetime", data: "data"});
	pgm.createTable({schema: "nokia_cm", name: "PM"}, {id: "id", load_datetime: "load_datetime", data: "data"});
};

exports.down = (pgm) => {
	pgm.dropTable({schema: "nokia_cm", name: 'LNRELG'});
	pgm.dropTable({schema: "nokia_cm", name: 'TOP'});
	pgm.dropTable({schema: "nokia_cm", name: 'PM'});
};
