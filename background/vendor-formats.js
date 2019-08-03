const VENDOR_CM_FORMATS = {
	'ERICSSON': ['BULKCM','CNAIV2','BSM'],
	'HUAWEI': ['GEXPORT_XML','NBI_XML','CFGMML'],
	'ZTE': ['BULKCM','XLS'],
	'NOKIA': ['RAML'],
	'BODASTAGE': ['BCF_CSV']
}

const VENDOR_PM_FORMATS = {
	'ERICSSON': ['BULKCM','CNAIV2'],
	'HUAWEI': ['GEXPORT_XML','NBI_XML','CFGMML'],
	'ZTE': ['BULKCM','XLS'],
	'NOKIA': ['RAML'],
	'BODASTAGE': []
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
		'BSM': 'boda-ericssonbsmparser.jar'
	},
	'HUAWEI': {
		'GEXPORT_XML': 'boda-huaweicmobjectparser.jar',
		'CFGMML': 'boda-huaweimmlparser.jar',
		'NBI_XML': 'boda-huaweicmxmlparser.jar'
	},
	'ZTE': {
		'BULKCM': 'boda-bulkcmparser.jar',
		'XLS': 'boda-ztexlscmparser.jar',
	},
	'NOKIA': {
		'RAML': 'boda-nokiacmdataparser.jar'
	}
}


exports.VENDOR_CM_PARSERS = VENDOR_CM_PARSERS;