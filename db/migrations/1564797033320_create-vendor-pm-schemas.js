exports.shorthands = undefined;

exports.up = (pgm) => {
	
	//Combined PM stats table
	pgm.createSchema("pm", {ifNotExists : true} );
	
	//Ericsson PM
	pgm.createTable(
		{schema: "pm", name: "huawei"}, 
		{
			id: "id",
			counter_id: {type: "integer"},
			measurement_id: {type: "integer"},
			counter_value: {type: "integer"},
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		}
	);	
};

exports.down = (pgm) => {
	pgm.dropTable({schema: "pm", name: 'huawei'});
	
	pgm.dropSchema("pm", {ifExists : true} );
};
