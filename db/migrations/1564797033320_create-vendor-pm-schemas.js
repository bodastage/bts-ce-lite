exports.shorthands = undefined;

exports.up = (pgm) => {
	
	//Combined PM stats table
	pgm.createSchema("pm", {ifNotExists : true} );
	
	//Ericsson PM
	pgm.createTable(
		{schema: "pm", name: "eri_meas_collec_xml"}, 
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
		},
		{ifNotExists : true}
	);	
	
	//Huawei PM - Measurement Collection XML -- NE Based
	pgm.createTable(
		{schema: "pm", name: "hua_ne_based_meas_collec_xml"}, 
		{
			id: "id",
			file_name: {type: "varchar(200)", notNull: true},
			collection_begin_time: {type: "timestamp"},
			collection_end_time: {type: "timestamp"},
			file_format_version: {type: "varchar(100)"},
			vendor_name: {type: "varchar(100)"},
			element_type: {type: "varchar(100)"},
			managed_element: {type: "varchar(200)"},
			meas_infoid: {type: "varchar(100)"},
			gran_period_duration: {type: "varchar(50)"},
			gran_period_endtime: {type: "timestamp"},
			rep_period_duration: {type: "varchar(50)"},
			meas_objldn: {type: "varchar(250)"},
			counter_id: {type: "integer"},
			counter_value: {type: "varchar(200)"},
			suspect: {type: "varchar(10)"},
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		}
	);	
};

exports.down = (pgm) => {
	pgm.dropTable({schema: "pm", name: 'eri_meas_collec_xml'}, {ifExists : true});
	pgm.dropTable({schema: "pm", name: 'hua_ne_based_meas_collec_xml'}, {ifExists : true});
	
	pgm.dropSchema("pm", {ifExists : true} );
};
