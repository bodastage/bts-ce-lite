const { Client, Pool } = window.require('pg');
const queryHelper = window.require('./query-helpers');
const fs = require("fs");

CONST TEMS_BCF_MAP = {
	"Cell":  "cellid",
	"Lat" : "latitude",
	"Latitude" : "latitude",
	"Lon" : "longitude",
	"Longitude" : "longitude",
	"MCC" : "mcc",
	"MNC" : "mnc",
	"LAC" : "lac",
	"RA" : "rac",
	"CI" : "ci",
	"ANT_DIRECTION" : "azimuth",
	"ANT DIR" : "azimuth",
	"ANT ORIENTATION": "azimuth",
	"ANT_BEAM_WIDTH" : "beam_width",
	"ANT_TYPE": "antenna_type",
	"ANT_HEIGHT": "height",
	"ANT_TILT": "mechanical_tilt",
	"CELL_TYPE": "cell_type",
	"UARFCN": "uarfcn",
	"SC"" : "psc",
	"RNC-ID": "rncid",
	"URA": "ura",
	"TIME_OFFSET": "",
	"CPICH_POWER": "",
	"MAX_TX_POWER": "",
	"NODE_B": ""
	"NODE_B_STATUS": "",
	"ARFCN": "",
	"BSIC": "basic"
	
};

CONST TEMS_GSM = [
	""
];