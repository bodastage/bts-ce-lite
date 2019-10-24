exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.createTable({schema: "pm", name: "kpis"}, {id: "id", load_datetime: "load_datetime", data: "data"});
};

exports.down = (pgm) => {
	pgm.dropTable({schema: "pm", name: 'kpis'});
};
