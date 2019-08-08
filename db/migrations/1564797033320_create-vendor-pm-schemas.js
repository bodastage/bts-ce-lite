exports.shorthands = undefined;

exports.up = (pgm) => {
	
	//Combined PM stats table
	pgm.createSchema("pm", {ifNotExists : true} );
	
	//Ericsson PM
	pgm.createTable(
		{schema: "pm", name: "ericsson"}, 
		{
			id: "id",
			file_name: {type: "varchar(200)", notNull: true},
			file_format_version: {type: "varchar(100)"},
			vendor_name: {type: "varchar(100)"},
			file_header_dnprefix: {type: "varchar(100)"},
			file_sender_localdn: {type: "varchar(100)"},
			element_type: {type: "varchar(100)"},
			collection_begin_time: {type: "timestamp"},
			collection_end_time: {type: "timestamp"},
			managed_element_localdn: {type: "varchar(200)"},
			ne_software_version: {type: "varchar(100)"},
			meas_infoid: {type: "varchar(100)"},
			meas_timestamp: {type: "timestamp"},
			jobid: {type: "integer"},
			gran_period_duration: {type: "varchar(50)"},
			gran_period_endtime: {type: "timestamp", default: "NOW()"},
			reporting_period: {type: "varchar(50)"},
			managed_element_userlabel: {type: "varchar(100)"},
			meas_objldn: {type: "varchar(250)"},
			meas_type: {type: "varchar(100)"},
			meas_result: {type: "varchar(100)"},
			suspect: {type: "varchar(10)"},
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		}
	);	
};

exports.down = (pgm) => {
	pgm.dropTable({schema: "pm", name: 'ericsson'}, {ifExists : true});
	
	pgm.dropSchema("pm", {ifExists : true} );
};
