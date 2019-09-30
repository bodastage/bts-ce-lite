export const COMP_OPERATORS = [
	"EQUAL TO", 
	"NOT EQUAL TO", 
	"GREATER THAN",
	"LESS THAN",
	"GREATER OR EQUAL TO",
	"LESS OR EQUAL TO",
	"IN", 
	"NOT IN", 
	"ENDS WITH", 
	"STARTS WITH", 
	"MATCHES REGEXP",
	"CONTAINS",
	"LENGTH EQUAL TO",
	"LENGTH LESS THAN",
	"LENGTH GREATER THAN"
];
export const COMP_VALUE_TYPES = ["COLUMN", "INPUT"];
export const COMP_PROPERTIES = ['background-color', 'color'];

/*
* Generate table cell style classes 
*/
export function generateStyleClass(reportId, fieldName, conditionIndex){
	const cleanedFieldName = fieldName.toLowerCase().replace(/[^a-zA-Z0-9]/g,"")
	return `tbl-rpt-${reportId}-${cleanedFieldName}-${conditionIndex}`
}


export function numberParser(str) {
    var newValue = str;
    var valueAsNumber;
    if (newValue === null || newValue === undefined || newValue === '') {
        valueAsNumber = null;
    } else {
        valueAsNumber = parseFloat(str);
    }
    return (isNaN(valueAsNumber) || valueAsNumber === null) ? str : valueAsNumber;
}

export function getTableStyleExpression(conditions){
	return conditions.map(cond => buildExpresion(cond)).join(" && ");
}

export function  buildExpresion(condition){
		let value = condition.rValue
		if(condition.rValType === 'COLUMN'){
			value = `data["${value}"]`
		}
		
		if(condition.op === 'EQUAL TO'){
			value = numberParser(value)
			return `x == ${value}`;
		}

		if(condition.op === 'NOT EQUAL TO'){
			value = numberParser(value)
			return `x != ${value}`;
		}
		
		if(condition.op === 'GREATER THAN'){
			value = numberParser(value)
			return `x > ${value}`;
		}		
		
		if(condition.op === 'LESS THAN'){
			value = numberParser(value)
			return `x < ${value}`;
		}
		
		if(condition.op === 'GREATER OR EQUAL TO'){
			value = numberParser(value)
			return `x >= ${value}`;
		}
		
		if(condition.op === 'LESS OR EQUAL TO'){
			value = numberParser(value)
			return `x <= ${value}`;
		}
		
		//Comma separated range
		if(condition.op === 'IN'){
			return `"${value}".split(',').indexOf(x) >= 0`;
		}
		
		//Comma separated range
		if(condition.op === 'NOT IN'){
			return `"${value}".split(',').indexOf(x) == -1`;
		}
		
		if(condition.op === 'ENDS WITH'){
			return `new RegExp(/${value}$/).test(x)`;
		}
		
		if(condition.op === 'STARTS WITH'){
			return `new RegExp(/^${value}/).test(x)`;
		}
		
		if(condition.op === 'CONTAINS'){
			return `new RegExp(/.*${value}.*/).test(x)`;
		}
		
		if(condition.op === 'MATCHES REGEXP'){
			return `new RegExp(/${value}/).test(x)`;
		}
		
		if(condition.op === 'LENGTH EQUAL TO'){
			return `x.length === ${value}`;
		}
		
		if(condition.op === 'LENGTH LESS THAN'){
			return `x.length < ${value}`;
		}
		
		if(condition.op === 'LENGTH GREATER THAN'){
			return `x.length > ${value}`;
		}
	}