//const hexToRgba = window.require('hex-to-rgba');
const rgbaToHex   = require('hex-and-rgba').rgbaToHex;
const hexToRgba   = window.require('hex-and-rgba').hexToRgba;
const COMP_OPERATORS = [
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

const COMP_VALUE_TYPES = ["COLUMN", "INPUT"];
const COMP_PROPERTIES = ['background-color', 'color'];
const CSS_EXCELJS_PROP_MAP = {
		"background-color": "fill-fgColor",
		"color": "font-color"
	};

//https://www.quackit.com/css/css_color_codes.cfm
const COLOR_NAME_TO_HEX = {
	"indianred": "cd5c5c",
	"lightcoral": "f08080",
	"salmon": "fa8072",
	"darksalmon": "e9967a",
	"lightsalmon": "ffa07a",
	"crimson": "dc143c",
	"red": "ff0000",
	"firebrick": "b22222",
	"darkred": "8b0000",
	"pink": "ffc0cb",
	"lightpink": "ffb6c1",
	"hotpink": "ff69b4",
	"deeppink": "ff1493",
	"mediumvioletred": "c71585",
	"palevioletred": "db7093",
	"greenyellow": "adff2f",
	"chartreuse": "7fff00",
	"lawngreen": "7cfc00",
	"lime": "00ff00",
	"limegreen": "32cd32",
	"palegreen": "98fb98",
	"lightgreen": "90ee90",
	"mediumspringgreen": "00fa9a",
	"springgreen": "00ff7f",
	"mediumseagreen": "3cb371",
	"seagreen": "2e8b57",
	"forestgreen": "228b22",
	"green": "008000",
	"darkgreen": "006400",
	"yellowgreen": "9acd32",
	"olivedrab": "6b8e23",
	"olive": "808000",
	"darkolivegreen": "556b2f",
	"cornsilk": "fff8dc",
	"blanchedalmond": "ffebcd",
	"bisque": "ffe4c4",
	"navajowhite": "ffdead",
	"wheat": "f5deb3",
	"burlywood": "deb887",
	"tan": "d2b48c",
	"rosybrown": "bc8f8f",
	"sandybrown": "f4a460",
	"goldenrod": "daa520",
	"darkgoldenrod": "b8860b",
	"peru": "cd853f",
	"chocolate": "d2691e",
	"saddlebrown": "8b4513",
	"sienna": "a0522d",
	"brown": "a52a2a",
	"maroon": "800000",
	"pink": "ffc0cb",
	"lightpink": "ffb6c1",
	"hotpink": "ff69b4",
	"deeppink": "ff1493",
	"mediumvioletred": "c71585",
	"palevioletred": "db7093",
	"coral": "ff7f50",
	"tomato": "ff6347",
	"orangered": "ff4500",
	"darkorange": "ff8c00",
	"orange": "ffa500",
	"gold": "ffd700",
	"yellow": "ffff00",
	"lightyellow": "ffffe0",
	"lemonchiffon": "fffacd",
	"lightgoldenrodyellow": "fafad2",
	"papayawhip": "ffefd5",
	"moccasin": "ffe4b5",
	"peachpuff": "ffdab9",
	"palegoldenrod": "eee8aa",
	"khaki": "f0e68c",
	"darkkhaki": "bdb76b",
	"lavender": "e6e6fa",
	"thistle": "d8bfd8",
	"plum": "dda0dd",
	"violet": "ee82ee",
	"orchid": "da70d6",
	"fuchsia": "ff00ff",
	"magenta": "ff00ff",
	"mediumorchid": "ba55d3",
	"mediumpurple": "9370db",
	"blueviolet": "8a2be2",
	"darkviolet": "9400d3",
	"darkorchid": "9932cc",
	"darkmagenta": "8b008b",
	"purple": "800080",
	"rebeccapurple": "663399",
	"indigo": "4b0082",
	"mediumslateblue": "7b68ee",
	"slateblue": "6a5acd",
	"darkslateblue": "483d8b",
	"aqua": "00ffff",
	"cyan": "00ffff",
	"lightcyan": "e0ffff",
	"paleturquoise": "afeeee",
	"aquamarine": "7fffd4",
	"turquoise": "40e0d0",
	"mediumturquoise": "48d1cc",
	"darkturquoise": "00ced1",
	"cadetblue": "5f9ea0",
	"steelblue": "4682b4",
	"lightsteelblue": "b0c4de",
	"powderblue": "b0e0e6",
	"lightblue": "add8e6",
	"skyblue": "87ceeb",
	"lightskyblue": "87cefa",
	"deepskyblue": "00bfff",
	"dodgerblue": "1e90ff",
	"cornflowerblue": "6495ed",
	"royalblue": "4169e1",
	"blue": "0000ff",
	"mediumblue": "0000cd",
	"darkblue": "00008b",
	"navy": "000080",
	"midnightblue": "191970",
	"white": "ffffff",
	"snow": "fffafa",
	"honeydew": "f0fff0",
	"mintcream": "f5fffa",
	"azure": "f0ffff",
	"aliceblue": "f0f8ff",
	"ghostwhite": "f8f8ff",
	"whitesmoke": "f5f5f5",
	"seashell": "fff5ee",
	"beige": "f5f5dc",
	"oldlace": "fdf5e6",
	"floralwhite": "fffaf0",
	"ivory": "fffff0",
	"antiquewhite": "faebd7",
	"linen": "faf0e6",
	"lavenderblush": "fff0f5",
	"mistyrose": "ffe4e1",
	"gainsboro": "dcdcdc",
	"lightgray": "d3d3d3",
	"lightgrey": "d3d3d3",
	"silver": "c0c0c0",
	"darkgray": "a9a9a9",
	"darkgrey": "a9a9a9",
	"gray": "808080",
	"grey": "808080",
	"dimgray": "696969",
	"dimgrey": "696969",
	"lightslategray": "778899",
	"lightslategrey": "778899",
	"slategray": "708090",
	"slategrey": "708090",
	"darkslategray": "2f4f4f",
	"darkslategrey": "2f4f4f",
	"black": "000000",
};

/*
* Generate table cell style classes 
*/
function generateStyleClass(reportId, fieldName, conditionIndex){
	const cleanedFieldName = fieldName.toLowerCase().replace(/[^a-zA-Z0-9]/g,"")
	return `tbl-rpt-${reportId}-${cleanedFieldName}-${conditionIndex}`
}


function numberParser(str) {
    var newValue = str;
    var valueAsNumber;
    if (newValue === null || newValue === undefined || newValue === '') {
        valueAsNumber = null;
    } else {
        valueAsNumber = parseFloat(str);
    }
    return (isNaN(valueAsNumber) || valueAsNumber === null) ? str : valueAsNumber;
}

function  checkStyleCondition(lValue, op, rValue){
	if(op === 'EQUAL TO'){
		return lValue == rValue;
	}

	if(op === 'NOT EQUAL TO'){
		return lValue != rValue;
	}
	
	if(op === 'GREATER THAN'){
		rValue = numberParser(rValue)
		lValue = numberParser(lValue)
		return lValue > rValue;
	}		
	
	if(op === 'LESS THAN'){
		rValue = numberParser(rValue)
		lValue = numberParser(lValue)
		return lValue < rValue;
	}
	
	if(op === 'GREATER OR EQUAL TO'){
		rValue = numberParser(rValue)
		lValue = numberParser(lValue)
		return lValue >= rValue;
	}
	
	if(op === 'LESS OR EQUAL TO'){
		rValue = numberParser(rValue)
		lValue = numberParser(lValue)
		return lValue <= rValue;
	}
	
	//Comma separated range
	if(op === 'IN'){
		return rValue.split(',').indexOf(lValue) >= 0;
	}
	
	//Comma separated range
	if(op === 'NOT IN'){
		return rValue.split(',').indexOf(lValue) == -1;
	}
	
	if(op === 'ENDS WITH'){
		return new RegExp(`${rValue}\$`).test(lValue);
	}
	
	if(op === 'STARTS WITH'){
		return new RegExp(`^${rValue}`).test(lValue);
	}
	
	if(op === 'CONTAINS'){
		return new RegExp(`.*${rValue}.*`).test(lValue);
	}
	
	if(op === 'MATCHES REGEXP'){
		return new RegExp(rValue).test(lValue);
	}
			
	if(condition.op === 'LENGTH EQUAL TO'){
		return lValue.length === rValue;
	}
	
	if(condition.op === 'LENGTH LESS THAN'){
		return lValue.length < rValue;
	}
	
	if(condition.op === 'LENGTH GREATER THAN'){
		return lValue.length > rValue;
	}
	
	return false;

}	


function cssColorToRGBA(cssColor){
	let hexValue = cssColor;
	if(typeof COLOR_NAME_TO_HEX[cssColor] !== 'undefined'){
		hexValue = "#" + COLOR_NAME_TO_HEX[cssColor];
	}

	return rgbaToHex(hexToRgba(hexValue)).replace('#','').toUpperCase();
}

function RGBAToARGB(hexRGBAVal){
	const a = hexRGBAVal.slice(6);
	const rgb = hexRGBAVal.slice(0,6);
	return `${a}${rgb}`
}

function cssColorToARGB(cssColor){
	return RGBAToARGB(cssColorToRGBA(cssColor));
}


//Converts css to ExcelJS styles 
function getExcelJsCellStyle(propName, propValue){
	if(typeof CSS_EXCELJS_PROP_MAP[propName] !== 'undefined'){
		
		//get category-property corresponding to CSS property 
		const catProp = CSS_EXCELJS_PROP_MAP[propName].split('-');
		const cat = catProp[0];
		const prop = catProp[1];
		
		let fill = {};
		if(cat === 'fill'){
			
			if(prop === 'bgColor'){
				fill = {
					...fill, 
					type: 'pattern',
					pattern: 'solid',
					bgColor: { argb: cssColorToARGB(propValue) }
				}
			}
			
			//background-color --> fill-fgColor
			if(prop === 'fgColor'){
				fill = {
					...fill, 
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: cssColorToARGB(propValue) }
				}
			}
		}
		
		let font = {}
		if(cat === 'font'){
			//color --> font-color
			if(prop === 'color'){
				font = {
					...font,
					color: {argb: cssColorToARGB(propValue) }
				}
			}
		}
		
		return {fill: fill, font: font}
	}
	
	return {}
}

exports.getExcelJsCellStyle = getExcelJsCellStyle;
exports.checkStyleCondition = checkStyleCondition;
exports.COMP_OPERATORS = COMP_OPERATORS;
exports.COMP_VALUE_TYPES = COMP_VALUE_TYPES;
exports.COMP_PROPERTIES = COMP_PROPERTIES;
