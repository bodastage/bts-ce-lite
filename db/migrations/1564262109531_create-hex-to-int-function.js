exports.shorthands = undefined;
const hexToIntParams = 		[
			{mode: 'in', name: "hexval", type: "varchar"}
		];
		
exports.up = (pgm) => {
	//Create hex to int function
	pgm.createFunction( 
		//name
		"hex_to_int", 
		
		//function_params
		hexToIntParams,
		
		//function_options
		{ 
			returns: "integer", 
			language: "plpgsql" 
		},

		//definiton
		`
		DECLARE
		   result  int;
		BEGIN
			EXECUTE 'SELECT x''' || hexval || '''::int' INTO result;
			RETURN result;
		END;
		` 
	);
		
	//Create hex to char function
	pgm.createFunction( 
		//name
		"hex_to_char", 
		
		//function_params
		hexToIntParams,
		
		//function_options
		{ 
			returns: "varchar", 
			language: "plpgsql" 
		},

		//definiton
		`
		DECLARE
		   result  varchar;
		BEGIN
			EXECUTE 'SELECT x''' || hexval || '''::int' INTO result;
			RETURN result;
		END;
		` 
	);

};

exports.down = (pgm) => {
	pgm.dropFunction("hex_to_int", hexToIntParams);
	pgm.dropFunction("hex_to_char", hexToIntParams);
};
