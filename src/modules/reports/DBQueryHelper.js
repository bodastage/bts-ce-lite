export async function runQuery(query){
	return await btslite_api.dbQuery(query);
}

export async function getQueryFieldsInfo(query){
	let result = null;
	try{
		result = await btslite_api.dbQuery(`SELECT * FROM (${query}) ttt LIMIT 1`);
		console.log(result);
		return result.length === 0 ? [] : Object.keys(result[0]);
	}catch(e){
		return {error: e}
	}

}

export function getSortAndFilteredQuery(query, columnNames, AGGridSortModel, AGGridFilterModel, AGGridColumns){
	let newQuery = `SELECT * FROM (${query}) qt`;
	let FilterCount = 0;
	
	if (typeof  AGGridFilterModel === 'undefined') return query;
	
	columnNames.forEach(function(col, index){
		if( typeof AGGridFilterModel[col] !== 'undefined' ){
            let filterModel = AGGridFilterModel[col];
            let value = AGGridFilterModel[col].filter;
			
			FilterCount++;//used to determine where to place WHERE phrase
			if(FilterCount === 1){
				newQuery += ` WHERE `
			}else{
				newQuery += ` AND `
			}
			
            if( typeof filterModel.operator === 'undefined'){
                let filterType = filterModel.type;
                //let filterValue= filterModel.filter;
				
                if( filterType === 'contains' ){
					newQuery += ` qt."${col}" LIKE '%${value}%' `
                }
				
                if( filterType === 'notEqual' ){
					newQuery += ` qt."${col}" ~ '^(?!${value}$)' `
                }
				
                if( filterType === 'equals' ){
					newQuery += ` qt."${col}" = '${value}' `                
                }
				
                if( filterType === 'startsWith' ){
					newQuery += ` qt."${col}" ~ '^${value}.*' `                
                }
				
                if( filterType === 'endsWith' ){
					newQuery += ` qt."${col}" ~ '.*${value}$' `                
                }
				
                //if( filterType === 'contains' ){
				//	newQuery += ` qt."${col}" ~ '^((?!${value}).)*$' `                
                //}
			}else{
                let filterOperator = filterModel.operator;
                let condition1 = filterModel.condition1;
                let condition2 = filterModel.condition2;
                let filterValue1 = "";
                let filterValue2 = "";
				
               if(condition1.type === 'contains') {
                    filterValue1 = ".*" + condition1.filter + ".*";
                }
                if( condition1.type === 'notEqual' ){
                    filterValue1 = '^(?!'+condition1.filter + "$)";                  
                }
                if( condition1.type === 'equals' ){
                    filterValue1 = '^'+condition1.filter + "$";           
                }
                if( condition1.type === 'startsWith' ){
                    filterValue1 = '^'+condition1.filter + ".*";                  
                }
                if( condition1.type === 'endsWith' ){
                    filterValue1 = '.*'+condition1.filter + "$";                 
                }
                if( condition1.type === 'notContains' ){
                    filterValue1 = '^((?!'+condition1.filter + ").)*$";                 
                }
                
                //condition2 filter
                if(condition2.type === 'contains') {
                    filterValue2 =  ".*" + condition2.filter + ".*";
                }
                if( condition2.type === 'notEqual' ){
                    filterValue2 = '^(?!'+condition2.filter + "$)";                  
                }
                if( condition2.type === 'equals' ){
                    filterValue2 = '^'+condition2.filter + "$";           
                }
                if( condition2.type === 'startsWith' ){
                    filterValue2 = '^'+condition2.filter + ".*";                  
                }
                if( condition2.type === 'endsWith' ){
                    filterValue2 = '.*'+condition2.filter + "$";                 
                }
                if( condition2.type === 'notContains' ){
                    filterValue2 = '^((?!'+condition2.filter + ").)*$";                 
                }

                
                newQuery +=  ` ( qt."${col}" ~ '${filterValue1}' ${filterOperator}  qt."${col}" ~ '${filterValue2}' ) `
			}
		}
	});
	
	//Sorting
    if(AGGridSortModel.length > 0 ){

        AGGridSortModel.forEach(function(model, idx){
            let col = model.colId;
            let dir = model.sort;
			
			if( idx === 0) {
				newQuery += ` ORDER BY `
			}else{
				newQuery += ","
			}
			
			newQuery += ` qt."${col}" ${dir}`
        });
    }
	
	return newQuery;
	
}

