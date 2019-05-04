export const VENDOR_CM_FORMSTS = {
	'ERICSSON': ['BULKCM','CNAIV2'],
	'HUAWEI': ['GEXPORT_XML','NBI_XML','CFGMML'],
	'ZTE': ['BULKCM','XLS'],
	'NOKIA': ['RAML']
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
		'XLS': 'boda_ztexlscmparser.jar',
	},
	'NOKIA': {
		'RAML': 'boda-nokiacmdataparser.jar'
	}
}