const VENDOR_CM_FORMATS = {
	'ERICSSON': ['BULKCM','CNAIV2','BSM','EAW'],
	'HUAWEI': ['GEXPORT_XML','NBI_XML','CFGMML', 'AUTOBAK_XML'],
	'ZTE': ['BULKCM','XLS'],
	'NOKIA': ['RAML'],
	'BODASTAGE': ['BCF_CSV']
}

const VENDOR_PM_FORMATS = {
	'ERICSSON': ['MEAS_COLLEC_XML'],
	'HUAWEI': ['NE_BASED_MEAS_COLLEC_XML'],
	'ZTE': ['BULKCM','XLS'],
	'NOKIA': ['RAML'],
	'BODASTAGE': ["CSV", "EXCEL"]
}

const VENDOR_FM_FORMATS = {
	'ERICSSON': ['BULKCM','CNAIV2'],
	'HUAWEI': ['GEXPORT_XML','NBI_XML','CFGMML'],
	'ZTE': ['BULKCM','XLS'],
	'NOKIA': ['RAML'],
	'BODASTAGE': []
}


/*Parser for each vendor CM file format*/
const VENDOR_CM_PARSERS = {
	'ERICSSON': {
		'BULKCM': 'boda-bulkcmparser.jar',
		'CNAIV2': 'boda-ericssoncnaiparser.jar',
		'BSM': 'boda-ericssonbsmparser.jar',
		'EAW': 'boda-ericssonaxeparser.jar'
	},
	'HUAWEI': {
		'GEXPORT_XML': 'boda-huaweicmobjectparser.jar',
		'CFGMML': 'boda-huaweimmlparser.jar',
		'NBI_XML': 'boda-huaweicmxmlparser.jar',
		'AUTOBAK_XML': 'boda-huaweicfgsynparser.jar'
	},
	'ZTE': {
		'BULKCM': 'boda-bulkcmparser.jar',
		'XLS': 'boda-ztexlscmparser.jar',
	},
	'NOKIA': {
		'RAML': 'boda-nokiacmdataparser.jar'
	},
	'MOTOROLA': {
		'CELL_X_EXPORT': 'boda-motorolacellxexportparser.jar'
	}
}

const VENDOR_PM_PARSERS = {
	'ERICSSON': {
		'MEAS_COLLEC_XML': 'boda-measdatacollectionparser.jar'
	},
	'HUAWEI':{
		'NE_BASED_MEAS_COLLEC_XML': 'boda-huaweipmdataparser.jar'
	},
	'NOKIA':{
		'PM_XML': 'boda-nokiapmdataparser.jar'
	}
}

const VENDOR_FM_PARSERS = {
}



exports.VENDOR_CM_FORMATS = VENDOR_CM_FORMATS;
exports.VENDOR_PM_FORMATS = VENDOR_PM_FORMATS;
exports.VENDOR_FM_FORMATS = VENDOR_FM_FORMATS;
exports.VENDOR_CM_PARSERS = VENDOR_CM_PARSERS;
exports.VENDOR_PM_PARSERS = VENDOR_PM_PARSERS;
exports.VENDOR_FM_PARSERS = VENDOR_FM_PARSERS;