exports.shorthands = undefined;

exports.up = (pgm) => {
	pgm.createSchema("reports", {ifNotExists : true} );
	
	//Create reports category table
	pgm.createTable(
		//name
		{schema: "reports", name: "categories"}, 
		//columns
		{
			id: "id", 
			name: {type: "varchar(200)", notNull: true, unique: true}, 
			parent_id: {type: "integer", notNull: true, default: 0},
			notes: {type: "text"},
			in_built: {type: "boolean", default: false},
			created_at: 'createdAt',
			modified_at: 'createdAt',
			created_by: {type: 'integer', default: 0},
			modified_by: {type: 'integer', default: 0}
		}
	);
	
	//Create reports table
	pgm.createTable(
		//name
		{schema: "reports", name: "reports"}, 
		//columns
		{
			id: "id", 
			name: {type: "varchar(200)", notNull: true, unique: true}, 
			parent_id: {type: "integer", notNull: true, default: 0},
			notes: {type: "text"},
			query: {type: "text"},
			options: {type: "json"},
			type: {type: "varchar(50)"},
			category_id: {type: "integer", default: 0},
			in_built: {type: "boolean", default: false},
			created_at: 'createdAt',
			modified_at: 'createdAt',
			created_by: {type: 'integer', default: 0},
			modified_by: {type: 'integer', default: 0}
		}
	);
};

exports.down = (pgm) => {
	pgm.dropTable({schema: "reports", name: "reports"});
	pgm.dropTable({schema: "reports", name: "categories"});
	pgm.dropSchema("reports", {ifExists : true} );
	
};
