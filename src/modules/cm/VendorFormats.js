export const VENDOR_CM_FORMATS = {
	'ERICSSON': ['BULKCM','CNAIV2'],
	'HUAWEI': ['GEXPORT_XML','NBI_XML','CFGMML'],
	'ZTE': ['BULKCM','XLS'],
	'NOKIA': ['RAML'],
	'BODASTAGE': ['BCF']
}

export const VENDOR_PM_FORMATS = {
	'ERICSSON': ['BULKCM'],
	'HUAWEI': ['XML','CSV','TSV','MRF'],
	'ZTE': ['BULKCM','XLS'],
	'NOKIA': ['RAML'],
	'BODASTAGE': []
}

export const VENDOR_FM_FORMATS = {
	'ERICSSON': ['BULKCM'],
	'HUAWEI': ['NBI_XML'],
	'ZTE': ['BULKCM','XLS'],
	'NOKIA': ['RAML'],
	'BODASTAGE': []
}


/*Parser for each vendor CM file format*/
export const VENDOR_PARSERS = {
	'ERICSSON': {
		'BULKCM': 'boda-bulkcmparser.jar',
		'CNAIV2': 'boda-ericssoncnaiparser.jar',
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