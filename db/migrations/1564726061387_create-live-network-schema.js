exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.createSchema("live_network", {ifNotExists : true} );

	
	//Nodes 
	pgm.createTable(
		{schema: "live_network", name: "nodes"}, 
		{
			id: "id", 
			technology: {type: "varchar(50)", default: "GSM"}, //gsm
			nodename: {type: "varchar(100)"},
			node_type: {type: "varchar(20)"}, //BSC, RNC, MBC
			vendor: {type: "varchar(50)"},
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		}
	);	
	
	
	//Sites 
	pgm.createTable(
		{schema: "live_network", name: "sites"}, 
		{
			id: "id", 
			technology: {type: "varchar(50)", default: "GSM"}, //gsm
			sitename: {type: "varchar(100)"},
			siteid: {type: "varchar(50)"},
			latitude: {type: "float"},
			longitude: {type: "float"},
			vendor: {type: "varchar(50)"},
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		}
	);	
	
	
	//Create 2G cells table 
	pgm.createTable(
		{schema: "live_network", name: "2g_cells"}, 
		{
			id: "id", 
			technology: {type: "varchar(50)", default: "GSM"}, //gsm
			ci: {type: "integer", notNull: true},
			cellname: {type: "varchar(100)"},
			siteid: {type: "varchar(50)"},
			carrier_layer: {type: "varchar(50)"},
			azimuth: {type: "float", notNull: true},
			electrical_tilt: {type: "float"},
			mechanical_tilt: {type: "float"},
			lac: {type: "integer", notNull: true},
			node: {type: "varchar(50)", notNull: true, comment: "BSC Name"},
			bcch: {type: "integer", notNull: true},
			trx_frequencies: {type: "text"},
			antenna_beam: {type: "float"},
			latitude: {type: "float"},
			longitude: {type: "float"},
			height: {type: "float"},
			vendor: {type: "varchar(50)"},
			cell_type: {type: "varchar(50)", comment: "macro, micro, indoor, etc"}, 
			bsic: {type: "varchar(5)"},
			bcc: {type: "integer"},
			ncc: {type: "integer"},
			mnc: {type: "integer"},
			mcc: {type: "integer"},
			cgi: {type: "varchar(200)"},
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		}
	);
	
	//Create 3g cells table 
	pgm.createTable(
		{schema: "live_network", name: "3g_cells"}, 
		{
			id: "id", 
			technology: {type: "varchar(50)", default: "UMTS"}, //UMTS,CDMA2000
			ci: {type: "integer", notNull: true},
			cellname: {type: "varchar(100)"},
			siteid: {type: "varchar(50)", comment: "Site name"},
			carrier_layer: {type: "varchar(50)"},
			azimuth: {type: "float", notNull: true},
			electrical_tilt: {type: "float"},
			mechanical_tilt: {type: "float"},
			lac: {type: "integer", notNull: true},
			rac: {type: "integer"},
			sac: {type: "integer"},
			node: {type: "varchar(50)", notNull: true, comment: "BSC Name"},
			psc: {type: "integer", notNull: true},
			uarfcn: {type: "integer", notNull: true},
			antenna_beam: {type: "float"},
			latitude: {type: "float"},
			longitude: {type: "float"},
			height: {type: "float"},
			vendor: {type: "varchar(50)"},
			cell_type: {type: "varchar(50)", comment: "macro, micro, indoor, etc"}, 
			mnc: {type: "integer"},
			mcc: {type: "integer"},
			cgi: {type: "varchar(200)"},
			rncid: {type: "integer"},
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		}
	);
	
	//Create 4g cells table 
	pgm.createTable(
		{schema: "live_network", name: "4g_cells"}, 
		{
			id: "id", 
			technology: {type: "varchar(50)", default: "LTE"}, 
			ci: {type: "integer", notNull: true},
			localcellid: {type: "integer", notNull: true},
			cellname: {type: "varchar(100)"},
			siteid: {type: "varchar(50)", comment: "Site name"},
			enodeb_id: {type: "varchar(50)"},
			carrier_layer: {type: "varchar(50)"},
			azimuth: {type: "float", notNull: true},
			electrical_tilt: {type: "float"},
			mechanical_tilt: {type: "float"},
			tac: {type: "integer"},
			node: {type: "varchar(50)", comment: "MME or Pool"},
			pci: {type: "integer", notNull: true},
			euarfcn: {type: "integer", notNull: true},
			bandwidth: {type: "integer"},
			ecgi: {type: "varchar(200)"},
			mnc: {type: "integer"},
			mcc: {type: "integer"},
			antenna_beam: {type: "float"},
			latitude: {type: "float"},
			longitude: {type: "float"},
			height: {type: "float"},
			vendor: {type: "varchar(50)"},
			cell_type: {type: "varchar(50)", comment: "macro, micro, indoor, etc"}, 
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		}
	);
	
	//Create 4g cells table 
	pgm.createTable(
		{schema: "live_network", name: "relations"}, 
		{
			id: "id", 
			svr_ci: {type: "integer", notNull: true},
			nbr_ci: {type: "integer", notNull: true},
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		}
	);
	
	//Create combined cell view 
	pgm.createView( 
		{name: "vw_cells", schema: "live_network"}, 
		{replace: true}, 
		`
		SELECT 
			t2g.technology,
			t2g.ci,
			t2g.cellname,
			t2g.siteid,
			t2g.carrier_layer,
			t2g.azimuth,
			t2g.electrical_tilt,
			t2g.mechanical_tilt,
			t2g.lac,
			null AS psc,
			null AS rac,
			null AS sac,
			t2g.node,
			null AS pci,
			null AS tac,
			t2g.cgi,
			t2g.bcch AS frequency,
			null AS bandwidth,
			t2g.antenna_beam,
			t2g.latitude,
			t2g.longitude,
			t2g.height,
			t2g.vendor,
			t2g.cell_type,
			t2g.bsic
		FROM 
			live_network."2g_cells" t2g
		UNION
		SELECT 
			t3g.technology,
			t3g.ci,
			t3g.cellname,
			t3g.siteid,
			t3g.carrier_layer,
			t3g.azimuth,
			t3g.electrical_tilt,
			t3g.mechanical_tilt,
			t3g.lac,
			t3g.psc,
			t3g.rac,
			t3g.sac,
			t3g.node,
			null AS pci,
			null AS tac,
			t3g.cgi,
			t3g.uarfcn AS frequency,
			null AS bandwidth,
			t3g.antenna_beam,
			t3g.latitude,
			t3g.longitude,
			t3g.height,
			t3g.vendor,
			t3g.cell_type,
			null AS bsic
		FROM 
			live_network."3g_cells" t3g
		UNION
		SELECT 
			t4g.technology,
			t4g.ci,
			t4g.cellname,
			t4g.siteid,
			t4g.carrier_layer,
			t4g.azimuth,
			t4g.electrical_tilt,
			t4g.mechanical_tilt,
			null AS lac,
			null AS psc,
			null AS rac,
			null AS sac,
			null AS node,
			t4g.pci::varchar,
			t4g.tac::varchar,
			t4g.ecgi as "cgi",
			t4g.euarfcn AS frequency,
			t4g.bandwidth::varchar AS bandwidth,
			t4g.antenna_beam,
			t4g.latitude,
			t4g.longitude,
			t4g.height,
			t4g.vendor,
			t4g.cell_type,
			null AS bsic
		FROM 
			live_network."4g_cells" t4g
		`
	);
	
	pgm.addConstraint({schema: "live_network", name: '2g_cells'}, "unq_ci_node_2g_cells", {unique: ["ci", "node"]});
	pgm.addConstraint({schema: "live_network", name: '3g_cells'}, "unq_ci_node_3g_cells", {unique: ["ci", "node"]});
	pgm.addConstraint({schema: "live_network", name: '4g_cells'}, "unq_ci_node_4g_cells", {unique: ["ci", "node"]});
	
	pgm.addConstraint({schema: "live_network", name: 'relations'}, "unq_relations", {unique: ["svr_ci", "nbr_ci"]});
	pgm.addConstraint({schema: "live_network", name: 'sites'}, "unq_sites", {unique: ["siteid"]});
	pgm.addConstraint({schema: "live_network", name: 'nodes'}, "unq_nodes", {unique: ["nodename"]});
	
};

exports.down = (pgm) => {
	pgm.dropConstraint({schema: "live_network", name: 'relations'}, "unq_relations");
	pgm.dropConstraint({schema: "live_network", name: '2g_cells'}, "unq_ci_node_2g_cells");
	pgm.dropConstraint({schema: "live_network", name: '3g_cells'}, "unq_ci_node_3g_cells");
	pgm.dropConstraint({schema: "live_network", name: '4g_cells'}, "unq_ci_node_4g_cells");
	pgm.dropView({schema: "live_network", name: 'vw_cells'});
	pgm.dropTable({schema: "live_network", name: 'relations'});
	pgm.dropTable({schema: "live_network", name: '2g_cells'});
	pgm.dropTable({schema: "live_network", name: '3g_cells'});
	pgm.dropTable({schema: "live_network", name: '4g_cells'});
	pgm.dropConstraint({schema: "live_network", name: 'sites'}, "unq_sites");
	pgm.dropConstraint({schema: "live_network", name: 'nodes'}, "unq_nodes");
	pgm.dropSchema("live_network", {ifExists : true} );
};
