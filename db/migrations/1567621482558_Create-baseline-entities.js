exports.shorthands = undefined;

exports.up = async (pgm) => {
	pgm.createSchema("baseline", {ifNotExists : true} );
	
	//baseline.configuration contains the managed objects and parameters whose baseline will
	//be computed
	pgm.createTable(
		{schema: "baseline", name: "configuration",  ifNotExists: true}, 
		{
			id: "id", 
			vendor: {type: "varchar(100)", notNull: true},
			technology: {type: "varchar(20)", notNull: true},
			mo: {type: "varchar(100)", notNull: true},
			parameter: {type: "varchar(300)", notNull: true},
			baseline: {type: "varchar(200)"}, //manually provided baseline value
			extra_fields: {type: "JSON"},
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		},
		{
			ifNotExists : true
		}
	);
	
	pgm.addConstraint(
		{schema: "baseline", name: 'configuration'}, 
		"unq_configuration", 
		{unique: ["vendor", "technology", "mo", "parameter"]}
	);
	

	//Cluters. How to group network entities.
	//The network entities are specified under entity_type CELL,CELLR,BTS,NODEB,ENODEB,GNODEB,BSC,RNC,MSC
	pgm.createTable(
		{schema: "baseline", name: "clusters"}, 
		{
			id: "id", 
			name: {type: "varchar(100)", notNull: true},
			entity_type: {type: "varchar(100)", notNull: true}, //What entities we are clustering. By default, these are CELL
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		},
		{
			ifNotExists : true
		}
	);
	
	//Maps a cluster to one or more network entities 
	//eg. 
	pgm.createTable(
		{schema: "baseline", name: "cluster_entities"}, 
		{
			id: "id", 
			name: {type: "varchar(100)", notNull: true},
			entity_type: {type: "varchar(20)", notNull: true},//e.g CELL,CELLR,BTS,NODEB,ENODEB,GNODEB,BSC,RNC,MSC
			entity_key: {type: "varchar(200)", notNull: true}, //eg: CI for entity type CELL or SITE-CI
			entity_value: {type: "varchar(200)", notNull: true}, //e.g  3456-1111
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		},
		{
			ifNotExists : true
		}
	);
	
	//Baseline score.  A score value for each posible baseline value 
	//The baseline will be selected from the value with the highest 
	//score 
	pgm.createTable(
		{schema: "baseline", name: "scores"}, 
		{
			id: "id", 
			vendor: {type: "varchar(100)", notNull: true},
			technology: {type: "varchar(100)", notNull: true},
			cluster: {type: "varchar(100)", notNull: true},
			mo: {type: "varchar(100)", notNull: true},
			parameter: {type: "varchar(300)", notNull: true},
			value: {type: "text", notNull: true},
			score: {type: "integer", notNull: true, default: 0},
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		},
		{
			ifNotExists : true
		}
	);
	

	pgm.addConstraint(
		{schema: "baseline", name: 'scores'}, 
		"unq_scores", 
		{unique: ["vendor", "technology", "cluster", "mo", "parameter", "value"]}
	);
 
 
	//Baseline values
	pgm.createTable(
		{schema: "baseline", name: "values"}, 
		{
			id: "id", 
			vendor: {type: "varchar(100)", notNull: true},
			technology: {type: "varchar(100)", notNull: true},
			cluster: {type: "varchar(100)", notNull: true},
			mo: {type: "varchar(100)", notNull: true},
			parameter: {type: "varchar(300)", notNull: true},
			value: {type: "text", notNull: true},
			created_at: "createdAt", 
			modified_at: "createdAt", 
			created_by: "createdBy",
			modified_by: "createdBy"
		},
		{
			ifNotExists : true
		}
	);
	
	
	//Baseline category. id=3
	pgm.sql(`
INSERT INTO 
	reports.categories (name, notes, parent_id, in_built)
VALUES
	('Baseline Audit','Baseline Audit Reports',0, true)
	`);
	
	pgm.sql(`
WITH baseline_cat AS ( SELECT id as cat_id FROM reports.categories WHERE name = 'Baseline Audit' )
INSERT INTO
	reports.reports (name, notes, query, options, type, category_id, in_built)
SELECT
	'Baseline Scores','Baseline Scores', 'SELECT vendor, technology, cluster, mo, parameter, value, score FROM baseline.scores', '{}', 'table', cat_id, true
FROM 
	baseline_cat
	`);
	
	pgm.sql(`
WITH baseline_cat AS ( SELECT id as cat_id FROM reports.categories WHERE name = 'Baseline Audit' )
INSERT INTO
	reports.reports (name, notes, query, options, type, category_id, in_built)
SELECT
	'Baseline Values','Baseline Values', 'SELECT vendor, technology, cluster, mo, parameter, value FROM baseline.values', '{}', 'table', cat_id, true
FROM 
	baseline_cat
	`);
	
	pgm.sql(`
WITH baseline_cat AS ( SELECT id as cat_id FROM reports.categories WHERE name = 'Baseline Audit' )
INSERT INTO
	reports.reports (name, notes, query, options, type, category_id, in_built)
SELECT
	'Baseline Comparison','Baseline Comparison', 'SELECT NULL AS "NULL"', '{}', 'table', cat_id, true
FROM 
	baseline_cat
	`);
	
	
	pgm.sql(`
WITH baseline_cat AS ( SELECT id as cat_id FROM reports.categories WHERE name = 'Baseline Audit' )
INSERT INTO
	reports.reports (name, notes, query, options, type, category_id, in_built)
SELECT
	'Parameter Reference','Parameter Reference', '
SELECT 
vendor as "VENDOR", 
technology AS "TECHNOLOGY", 
mo as "MO", 
parameter_id as "PARAMETER ID", 
parameter_name as "PARAMETER NAME", 
granurality as "GRANURALITY", 
is_key as "IS_KEY", 
description as "DESCRIPTION" 
FROM telecomlib.parameter_reference 
	', '{}', 'table', cat_id, true
FROM 
	baseline_cat
	`);
	
	pgm.sql(`
WITH baseline_cat AS ( SELECT id as cat_id FROM reports.categories WHERE name = 'Baseline Audit' )
INSERT INTO
	reports.reports (name, notes, query, options, type, category_id, in_built)
SELECT
	'Baseline Reference','Baseline Reference', '
		SELECT 
	vendor as "VENDOR", 
	technology AS "technology", 
	mo as "MO", 
	parameter as "PARAMETER", 
	baseline as "BASELINE_VALUE" 
	FROM baseline.vw_configuration 
	', '{}', 'table', cat_id, true 
FROM 
	baseline_cat
	`);
	
	//Create configuration view 
	pgm.createView( { schema: "baseline", name: "vw_configuration"}, 
	{replace: true}, 
	`
SELECT  
	t1.id,
	t1.vendor, 
	t1.technology, 
	t1.mo, 
	t1.parameter, 
	t1.baseline
FROM 
baseline.configuration t1 
LEFT JOIN telecomlib.parameter_reference t2  
	ON t1.vendor  = t2.vendor 
	AND t1.technology = t2.technology 
	AND t1.mo = t2.mo 
	AND t1.parameter = t2.parameter_id 
	
	` )
	
};
exports.down = (pgm) => {
	pgm.dropView({schema: "baseline", name: 'vw_configuration'});
	
	pgm.sql(`DELETE FROM reports.reports WHERE name = 'Baseline Scores'`)
	pgm.sql(`DELETE FROM reports.reports WHERE name = 'Baseline Values'`)
	pgm.sql(`DELETE FROM reports.reports WHERE name = 'Baseline Discrepancies'`)
	pgm.sql(`DELETE FROM reports.reports WHERE name = 'Baseline Comparison'`)
	pgm.sql(`DELETE FROM reports.reports WHERE name = 'Baseline Reference'`)
	pgm.sql(`DELETE FROM reports.reports WHERE name = 'Parameter Reference'`)
	
	//Remove baseline categories
	pgm.sql(`DELETE FROM reports.categories WHERE name = 'Baseline Audit'`)
	
	pgm.dropTable({schema: "baseline", name: 'configuration', ifExists: true});
	pgm.dropTable({schema: "baseline", name: 'values'});
	pgm.dropTable({schema: "baseline", name: 'scores'});
	pgm.dropTable({schema: "baseline", name: 'clusters'});
	pgm.dropTable({schema: "baseline", name: 'cluster_entities'});
	
	pgm.dropSchema("baseline", {ifExists : true} );
};
