const GSM_KEY_PARAMAETERS = `
--2G Parameters 
--2G Parameters / ZTE(xls)
SELECT 
	t1.data->>'DATETIME' AS "DATETIME",
	'ZTE' AS "VENDOR",
    '2G' AS "TECH",
    t1.data->>'cellIdentity' AS "CELLID",
	t1.data->>'userLabel' AS "CELLNAME",
	(REGEXP_REPLACE(t1.data->>'refGLocationArea','(\\d+),\\d+,\\d+,\\d+','\\1')) AS "MCC",
	(REGEXP_REPLACE(t1.data->>'refGLocationArea','\\d+,(\\d+),\\d+,\\d+','\\1')) AS "MNC",
	(REGEXP_REPLACE(t1.data->>'refGLocationArea','\\d+,\\d+,(\\d+),\\d+','\\1')) AS "LAC",
	t1.data->>'refGRoutingArea' AS "RAC",
	CONCAT((REGEXP_REPLACE(t1.data->>'refGLocationArea','(\\d+),\\d+,\\d+,\\d+','\\1')),'-',(REGEXP_REPLACE(t1.data->>'refGLocationArea','\\d+,(\\d+),\\d+,\\d+','\\1')),'-',(REGEXP_REPLACE(t1.data->>'refGLocationArea','\\d+,\\d+,(\\d+),\\d+','\\1')),'-',TRIM(t1.data->>'cellIdentity')) AS "CGI",
	t1.data->>'bcchFrequency' AS "2G_BCCHNO",
	CONCAT(trim(t1.data->>'ncc'),trim(t1.data->>'bcc')) AS "2G_BSIC"
	FROM zte_cm."GsmCell" t1 where t1.data->>'MEID' is not null
UNION
--2G Parameters / ZTE(bulk_CM)
SELECT 
	t1.data->>'DATETIME' AS "DATETIME",
	'ZTE' AS "VENDOR",
    '2G' AS "TECH",
	t1.data->>'cellIdentity' AS ci,
	t1.data->>'userLabel' AS name,
	t1.data->>'mcc' as mcc,
	t1.data->>'mnc' as mnc,
	t1.data->>'lac' AS lac,
	t1.data->>'rac' as rac,
	CONCAT( TRIM(t1.data->>'mcc'),'-', TRIM(t1.data->>'mnc'),'-',TRIM(t1.data->>'lac'),'-',TRIM(t1.data->>'cellIdentity')) AS cgi,
	t1.data->>'bcchFrequency' AS bcch,
	CONCAT(trim(t1.data->>'ncc'),trim(t1.data->>'bcc')) AS bsic
FROM zte_cm."GsmCell" t1 where t1.data->>'SubNetwork_id' is not null
UNION
--2G Parameters / Huawei(CFGMML&NBI)
SELECT 
	t1.data->>'DATETIME' AS "DATETIME", 
	'HUAWEI' AS "VENDOR", 
	'2G' AS "TECHNOLOGY", 
    t1.data->>'CI' AS "CI",
	t1.data->>'CELLNAME' AS "CELLNAME", 
	t1.data->>'MCC' AS "MCC", 
	t1.data->>'MNC' AS "MNC", 
	t1.data->>'LAC' AS "LAC", 
	null as rac,
	CONCAT(t1.data->>'MCC', '-', t1.data->>'MNC', '-', LPAD(t1.data->>'LAC',5,'0'), '-', t1.data->>'CI') AS "CGI",
	t4.data->>'FREQ' AS "BCCHNO", 
	CONCAT(t1.data->>'NCC', t1.data->>'BCC') AS "BSIC"
	FROM huawei_cm."GCELL" t1 
INNER JOIN huawei_cm."GTRX" t4 ON t1.data->>'CELLID' = t4.data->>'CELLID' and t1.data->>'BSCID' = t4.data->>'BSCID' where t4.data->>'ISMAINBCCH' = 'YES'
UNION 
--2G Parameters / Ericsson(Bulk_CM)
SELECT
    t1.data->>'DATETIME' AS "DATETIME",
    'ERICSSON' AS "VENDOR",
    '2G' AS "TECHNOLOGY",
    t1.data->>'CI' AS "CELLID",
    t1.data->>'CELL_NAME' AS "CELLNAME",
    t1.data->>'MCC' AS "MCC",
    t1.data->>'MNC' AS "MNC",
    t1.data->>'LAC' AS "LAC",
    '' AS "RAC",	
    CONCAT(t1.data->>'MCC', ' - ', LPAD(t1.data->>'MNC', 2, '0'), ' - ', LPAD(t1.data->>'LAC',5 ,'0'), ' - ', LPAD(t1.data->>'CI', 5,'0')) AS "CGI",
    t1.data->>'BCCHNO',
    CONCAT(t1.data->>'BCC', t1.data->>'NCC') AS "BSIC"
    FROM ericsson_cm."INTERNAL_CELL" t1
UNION
--2G Parameters / Nokia(RAML)
SELECT 
	t1.data->>'DATETIME' AS "DATETIME",
	'NOKIA' AS "VENDOR",
    '2G' AS "TECH",
    t1.data->>'cellId' AS ci,
    t1.data->>'name' as Cellname,
    t1.data->>'locationAreaIdMCC' as MCC,
    t1.data->>'locationAreaIdMNC' as MNC,
    t1.data->>'locationAreaIdLAC' as LAC,
    null,
    CONCAT( TRIM(t1.data->>'locationAreaIdMCC'),'-', TRIM(t1.data->>'locationAreaIdMNC'),'-',TRIM(t1.data->>'locationAreaIdLAC'),'-',TRIM(t1.data->>'cellId')) AS cgi,
    t2.data->>'initialFrequency' AS bcch,
    CONCAT(TRIM(t1.data->>'bsIdentityCodeNCC'), TRIM(t1.data->>'bsIdentityCodeBCC')) AS bsic
FROM nokia_cm."BTS" t1
INNER JOIN nokia_cm."TRX" t2 ON
    t1.data->>'DISTNAME' = SUBSTRING(t2.data->>'DISTNAME', '.*BTS-\\d+')
`


const ERICSSON_3G_KEY_PARAMAETERS = `
SELECT t1.data->>'DATETIME' AS "DATETIME",
	   'ERICSSON' AS "VENDOR",
	   '3G' AS "TECHNOLOGY",
	   t1.data->>'SubNetwork_2_id' AS "NENAME",
	   t2.data->>'cId' AS "CELLID",
	   t2.data->>'userLabel' AS "CELLNAME",
--        t3."CELLNAME_SC",
	   SUBSTRING(t2.data->>'userLabel', 2, 3) AS "SITEPROP",
	   SUBSTRING(LPAD(t2.data->>'cId', 5, '0'),0, 4) AS "SITEID",
	   t3.data->>'MeContext_id' as "SITENAME",
	   t1.data->>'plmnIdentity_mcc' AS "MCC",
	   t1.data->>'plmnIdentity_mnc' AS "MNC",
	   t2.data->>'lac' AS "LAC",
	   t2.data->>'rac' AS "RAC",
	   t2.data->>'uarfcnDl' AS "DLF",
	   t2.data->>'uarfcnUl' AS "ULF",
	   CASE WHEN t2.data->>'administrativeState' = '1' THEN 'UNLOCKED'
			WHEN t2.data->>'administrativeState' = '0' THEN 'LOCKED'
			ELSE 'SHUTTING_DOWN'
	   END
	   AS "ACTSTATUS",
	   '' AS "BLKSTATUS",
	   t2.data->>'primaryScramblingCode' AS "PSC",
	   t2.data->>'cId' AS "CID",
	   t2.data->>'cId' AS "CI",
	   CONCAT(t1.data->>'plmnIdentity_mcc', '-', LPAD(t1.data->>'plmnIdentity_mnc', 2, '0'), '-',LPAD(t2.data->>'lac',5, '0'), '-', LPAD(t2.data->>'cId',5, '0')) AS CGI,
	   CONCAT(t1.data->>'plmnIdentity_mcc', '-', t1.data->>'plmnIdentity_mnc', '-', t2.data->>'lac', '-', t2.data->>'cId') AS "CGI_RAW",
	   '' AS "CGI_HEX"
FROM ericsson_cm."UtranNetwork" t1
	INNER JOIN ericsson_cm."UtranCell"  t2 ON t2.data->>'SubNetwork_2_id'  = t1.data->>'SubNetwork_2_id'
	LEFT JOIN ericsson_cm."RbsLocalCell" t3 ON t1.data->>'SubNetwork_2_id' = t1.data->>'SubNetwork_2_id'
		AND t2.data->>'cId' = t3.data->>'localCellId'

`

const ERICSSON_4G_KEY_PARAMAETERS = `
SELECT 
	t1.data->>'DATETIME' AS "DATETIME",
	'ERICSSON' AS "VENDOR",
	'4G' AS "TECHNOLOGY",
	t1.data->>'SubNetwork_2_id' AS "NENAME",
	'' AS "NEID",
	SUBSTRING(t2.data->>'MeContext_id',2, 3) AS "SITEPROP",
    t2.data->>'eNBId' AS "SITEID",
    t2.data->>'MeContext_id' AS "SITENAME",
    t1.data->>'cellId' AS "CELLID",
    t1.data->>'userLabel' AS "CELLNAME",
    256* CAST( t2.data->>'eNBId' AS integer) + CAST(t1.data->>'cellId' AS integer) AS "CI",
	CASE WHEN t1.data->>'administrativeState' = '1' THEN 'UNLOCKED'
		WHEN t1.data->>'administrativeState' = '0' THEN 'LOCKED'
		ELSE 'SHUTTING_DOWN'
    END
    AS "ACTSTATUS",
	'' AS "BLKSTATUS",
    t1.data->>'dlChannelBandwidth' AS "DLBANDWIDTH",
--        t1.[BAND],
	'' AS "CARR",
	t1.data->>'earfcndl' AS "DLF",
	t1.data->>'earfcnul' AS "ULF",
	t1.data->>'mcc' AS "MCC",
	t1.data->>'mnc' AS "MNC",
	'' AS "LAC",
	'' AS "RAC",
	CONCAT(t1.data->>'mcc','-', t1.data->>'mnc', '-', LPAD(t1.data->>'MeContext_id', 5,'0'), '-',LPAD(t1.data->>'cellId', 3, '0')) AS "CGI",
	t1.data->>'physicalLayerCellIdGroup' AS "PCI",
	t1.data->>'tac' AS  "TAC",
	t1.data->>'rachRootSequence'  AS "ROOTSEQ"
FROM ericsson_cm."EUtranCellFDD" t1
INNER JOIN ericsson_cm."ENodeBFunction" t2 ON t2.data->>'SubNetwork_2_id' = t1.data->>'SubNetwork_2_id'

`;

const HUAWEI_2G_KEY_PARAMAETERS = `
	SELECT 
	t1.data->>'DATETIME' AS "DATETIME", 
	t2.data->>'SYSOBJECTID' as "NENAME", 
	'HUAWEI' AS "VENDOR", 
	'2G' AS "TECHNOLOGY", 
	--t3.data->>'BTSNAME' AS "SITENAME", 
	--t3.data->>'BTSID' AS "SITEID", 
	t1.data->>'CELLNAME' AS "CELLNAME", 
	t1.data->>'ACTSTATUS' AS "ACTSTATUS", 
	t1.data->>'ADMSTAT' AS "BLKSTATUS", 
	t1.data->>'MCC' AS "MCC", 
	t1.data->>'MNC' AS "MNC", 
	t1.data->>'LAC' AS "LAC", 
	t1.data->>'CI' AS "CI", 
	t4.data->>'FREQ' AS "BCCHNO", 
	t1.data->>'NCC' AS "NCC", 
	t1.data->>'BCC' AS "BCC", 
	CONCAT(t1.data->>'NCC', t1.data->>'BCC') AS "BSIC", 
	CONCAT(t1.data->>'MCC', '-', t1.data->>'MNC', '-', t1.data->>'LAC', '-', t1.data->>'CI') AS "CGI_RAW", 
	CONCAT(t1.data->>'MCC', '-', t1.data->>'MNC', '-', LPAD(t1.data->>'LAC',5,'0'), '-', t1.data->>'CI') AS "CGI" 
	FROM huawei_cm."GCELL" t1 
	INNER JOIN huawei_cm."SYS" t2 ON t1.data->>'BSCID' = t2.data->>'BSCID' 
	--INNER JOIN huawei_cm."BTS" t3 ON t3.data->>'BTSID' = t1.data->>'BTSID' AND t1.data->>'FILENAME' = t3.data->>'FILENAME'
	INNER JOIN huawei_cm."GTRX" t4 ON t1.data->>'CELLID' = t4.data->>'CELLID' and t1.data->>'BSCID' = t4.data->>'BSCID' where t4.data->>'ISMAINBCCH' = 'YES'
`;


const HUAWEI_3G_KEY_PARAMAETERS = `
SELECT 
	t1.data->>'DATETIME' AS "DATETIME", 
	t2.data->>'SYSOBJECTID' AS "NENAME", 
	'HUAWEI' AS "VENDOR", 
	'3G' AS "TECHNOLOGY", 
	'' AS "NEID", 
	t4.data->>'NODEBFUNCTIONNAME' AS "SITENAME", 
	t4.data->>'NODEBID' AS "SITEID", 
	t1.data->>'CELLNAME' AS "CELLNAME", 
	t1.data->>'ACTSTATUS' AS "ACTSTATUS", 
	t1.data->'ADMSTAT' AS "BLKSTATUS", 
	t5.data->>'MCC' AS "MCC", 
	t5.data->>'MNC' AS "MNC", 
	t1.data->>'LAC' AS "LAC", 
	t1.data->>'RAC' AS "RAC", 
	t1.data->>'SAC' AS "SAC", 
	t1.data->>'LOCELL' AS "CI", 
	t1.data->>'UARFCNDOWNLINK' AS "DLF", 
	t1.data->>'UARFCNUPLINK' AS "ULF", 
	t1.data->>'PSCRAMBCODE' AS "PSCRAMBCODE", 
	CONCAT(t5.data->>'MCC', '-', t5.data->>'MNC', '-', t1.data->>'LAC', '-', t1.data->>'LOCELL') AS "CGI_RAW", 
	CONCAT(t5.data->>'MCC', '-', t5.data->>'MNC', '-', LPAD(t1.data->>'LAC',5,'0'), '-', t1.data->>'LOCELL') AS "CGI" 
FROM huawei_cm."UCELL" t1 
	INNER JOIN huawei_cm."SYS" t2 ON t1.data->>'FILENAME' = t2.data->>'FILENAME' 
	INNER JOIN huawei_cm."URNCBASIC" t3 ON t3.data->>'RNCID' = t1.data->>'LOGICRNCID' AND t1.data->>'FILENAME' = t3.data->>'FILENAME' 
	INNER JOIN huawei_cm."UNODEB" t4 ON t1.data->>'FILENAME' = t1.data->>'FILENAME' 
	INNER JOIN huawei_cm."UCNOPERATOR" t5 ON t5.data->>'FILENAME' = t1.data->>'FILENAME'
`;

const HUAWEI_4G_KEY_PARAMAETERS = `
	SELECT
	t1.data->>'DATETIME' AS "DATETIME",
	t2.data->>'SYSOBJECTID' as "NENAME",
	'HUAWEI' AS "VENDOR",
	'4G' AS "TECHNOLOGY",
	'' AS "NEID",
	t1.data->>'ENODEBFUNCTIONNAME' AS "SITENAME",
	t4.data->>'ENODEBID' AS "SITEID",
	t1.data->>'CELLNAME' AS "CELLNAME",
	t1.data->>'CELLACTIVESTATE' AS "ACTSTATUS",
	-- t1."ADMSTAT" AS "BLKSTATUS",
	t5.data->>'MCC' AS "MCC",
	t5.data->>'MNC' AS "MNC",
	t6.data->>'TAC' AS "TAC",
	t1.data->>'CELLID' AS "CI",
	t1.data->>'PHYCELLID' AS "PCI",
	t1.data->>'DLBANDWIDTH' AS "UARFCNDOWNLINK",
	t1.data->>'DLEARFCN' AS "DLF",
	t1.data->>'ULEARFCN' AS "ULF",
	CONCAT(t5.data->>'MCC', '-', t5.data->>'MNC', '-', t4.data->>'ENODEBID', '-', t1.data->>'LOCALCELLID') AS "CGI_RAW",
	CONCAT(t5.data->>'MCC', '-', t5.data->>'MNC', '-', LPAD(t4.data->>'ENODEBID',5,'0'), '-', t1.data->>'LOCALCELLID') AS "CGI"
	FROM huawei_cm."CELL" t1
	INNER JOIN huawei_cm."SYS" t2 ON t1.data->>'FILENAME' = t2.data->>'FILENAME'
	INNER JOIN huawei_cm."ENODEBFUNCTION" t4 ON t4.data->>'FILENAME' = t1.data->>'FILENAME'
	INNER JOIN huawei_cm."CNOPERATOR" t5 ON t5.data->>'FILENAME' = t1.data->>'FILENAME'
	INNER JOIN huawei_cm."CNOPERATORTA" t6 ON t6.data->>'FILENAME' = t1.data->>'FILENAME'

`;

const ZTE_2G_KEY_PARAMAETERS = `
SELECT 
	t1.data->'userLabel' AS name,
	t1.data->'cellIdentity' AS ci,
	t1.data->'bcc' AS bcc,
	t1.data->'ncc' AS ncc,
	CONCAT(trim(t1.data->>'ncc'),trim(t1.data->>'bcc')) AS bsic,
	t1.data->>'bcchFrequency' AS bcch,
	t1.data->>'lac' AS lac,
	t1.data->>'Latitude' AS latitude,
	t1.data->>'Longitude' as longitude ,
	CONCAT( TRIM(t1.data->>'mcc'),'-', TRIM(t1.data->>'mnc'),'-',TRIM(t1.data->>'lac'),'-',TRIM(t1.data->>'cellIdentity')) AS cgi,
	t1.data->>'mcc' as mcc,
	t1.data->>'mnc' as mnc,
	t1.data->>'altitude' AS height
FROM zte_cm."GsmCell" t1

`;

const ZTE_3G_KEY_PARAMAETERS = `
SELECT 
	t1.data->>'varDateTime' AS "DATETIME", 
	t1.data->>'bchPower' AS "bchPower",
	t1.data->>'cid' as ci,
	t1.data->>'refULocationArea' AS "lac",
	((t1.data->>'anteLatitude')::float/93206.76)*(-1::float*(t1.data->>'anteLatitudeSign')::float) AS "latitude",
	(t1.data->>'anteLongitude')::float/46603.38 as longitude,
	t1.data->>'maximumTransmissionPower' AS "maxTxPower",
	t1.data->>'primaryCpichPower' AS "cpichPower",
	t1.DATA->>'primarySchPower' AS "primarySchPower",
	t1.data->>'primaryScramblingCode' AS psc,
	t1.data->>'refURoutingArea' AS rac,
	t1.data->>'sac' AS sac,
	t1.data->>'secondarySchPower' AS "secondarySchPower",
	t1.data->>'uarfcnDl' AS "uarfcnDl",
	t1.data->>'uarfcnUl' AS "uarfcnUl",
	t1.data->>'uraList' AS ura,
	t1.data->>'altitude' AS "altitude",
	t2.data->>'mcc' AS mcc,
	t2.data->>'mnc' AS mnc,
	t1.data->>'localCellId' AS "localcellid"
FROM zte_cm."UtranCellFDD" t1
INNER JOIN zte_cm."LogicalCell" t2 on  t2.data->>'MEID' = t1.data->>'MEID' 
    AND t2.data->>'rncid' = t1.data->>'rncid'
    AND t2.data->>'cid' = t1.data->>'cid'

`;

const ZTE_4G_KEY_PARAMAETERS = `
SELECT 
	t1.data->>'DATETIME' AS "DATETIME", 
	t1.data->>'EUtranCellFDD_id' as name,
	t1.data->>'earfcnDl' as "earfcnDl",
	t1.data->>'earfcnUl' as "earfcnUl",
	t1.data->>'tac' as "tac",
	t1.data->>'pci' as "pci",
	((t1.data->>'latitude')::float/93206.76)*(-1::float)  as latitude,
	(t1.data->>'longitude')::float/46603.38 as longitude,
	t1.data->>'bandWidthDl' as "bandWidthDl",
	t1.data->>'bandWidthUl' as "bandWidthUl",
	t1.data->>'cellRadius'  as "cellRadius"
FROM zte_cm."EUtranCellFDD" t1
`;

	
//eslint-disable-next-line
const NOKIA_2G_KEY_PARAMAETERS = `
SELECT
	t1.data->>'DATETIME' AS "DATETIME", 
	CONCAT(TRIM(t1.data->>'name'),'(',TRIM(t1.data->>'cellId'), ')') AS name,
	t1.data->>'cellId' AS ci,
	t1.data->>'bsIdentityCodeBCC' AS bcc,
	t1.data->>'bsIdentityCodeNCC' AS ncc,
	CONCAT(TRIM(t1.data->>'bsIdentityCodeNCC'), TRIM(t1.data->>'bsIdentityCodeBCC')) AS bsic,
	t2.data->>'initialFrequency' AS bcch,
	t1.data->>'locationAreaIdLAC' AS lac,
	CONCAT( TRIM(t1.data->>'locationAreaIdMCC'),'-', TRIM(t1.data->>'locationAreaIdMNC'),'-',TRIM(t1.data->>'locationAreaIdLAC'),'-',TRIM(t1.data->>'cellId')) AS cgi,
	t1.data->>'angle' AS azimuth,
	t1.data->>'hoppingSequenceNumber1' AS hsn,
	t1.data->>'hoppingMode' AS "hoppingType",
	t1.data->>'locationAreaIdMCC' as mcc,
	t1.data->>'locationAreaIdMNC' as mnc
FROM nokia_cm."BTS" t1
INNER JOIN nokia_cm."TRX" t2 ON
    t1.data->>'DISTNAME' = SUBSTRING(t2.data->>'DISTNAME', '.*BTS-\\d+')
INNER JOIN nokia_cm."BCF" t3 ON 
	t3.data->>'FILENAME' = t1.data->>'FILENAME' 
	AND CONCAT(TRIM(t3.data->>'DISTNAME'), '/BTS-',TRIM(t1.data->>'segmentId')) = TRIM(t1.data->>'DISTNAME')
WHERE 
  TRIM(t2.data->>'preferredBcchMark') = 'The TRX is a preferred TRX (P)'
`

//eslint-disable-next-line
const NOKIA_3G_KEY_PARAMAETERS = `
SELECT
	t1.data->>'DATETIME' AS "DATETIME", 
	t1.data->>'CId' AS "CId",
	t1.data->>'LAC' AS lac,
	t1.data->>'PtxCellMax' AS "maxTxPower",
	t1.data->>'name' AS "cellName",
	t1.data->>'PtxPrimaryCPICH'  AS "cpichPower",
	t1.data->>'PtxPrimarySCH' AS "primarySchPower",
	t1.data->>'PriScrCode' AS "psc",
	t1.data->>'RAC' as "rac",
	t1.data->>'SAC' AS "sac",
	t1.data->>'PtxSecSCH' AS "secondarySchPower",
	t1.data->>'UARFCN' AS "uarfcnDl",
	t1.data->>'URAId' AS ura ,
	t1.data->>'WCELMCC' AS mcc,
	t1.data->'WCELMNC' AS mnc,
	t1.data->>'URAId' AS ura,
	t1.data->>'CId' AS ci
FROM nokia_cm."WCEL" t1
INNER JOIN nokia_cm."WBTS" t2 ON
	t2.data->>'FILENAME' = t1.data->>'FILENAME' 
    AND TRIM(t2.data->>'DISTNAME') = SUBSTRING(t1.data->>'DISTNAME','.*WBTS-\\d+')
`

//eslint-disable-next-line
const NOKIA_4G_KEY_PARAMAETERS = `
SELECT
	t1.data->>'DATETIME' AS "DATETIME", 
	TRIM(t1.data->>'name') AS "name",
	t1.data->>'earfcnUL' AS "uarfcnDl",
	t1.data->>'mcc' AS mcc,
	t1.data->>'mnc' AS mnc,
	t1.data->>'tac' AS tac,
	t1.data->>'phyCellId' AS pci,
	t1.data->>'rootSeqIndex' AS "rachRootSequence",
	t1.data->>'altitude' AS height,
	t1.data->'dlChBw' AS "dlBandwidth"
FROM nokia_cm."LNCEL" t1
`

const COMBINED_KEY_PARAMAETERS = `
--KEY PARAMETERS (3G Huawei CFGMML)
SELECT
    t1.data->>'DATETIME' AS "DATETIME",
    NULL AS "STATE",
    NULL AS "REGIONAL",
    'HUAWEI' AS "VENDOR",
    '3G' AS "TECH",
    t2.data->>'SYSOBJECTID' AS "NENAME",
    t1.data->>'BSCID' AS "NEID",
    NULL AS "SITEPROP LAT",
    NULL AS "SITEPROP LON",
    t3.data->>'NODEBID' AS "SITE  ID",
    t1.data->>'NODEBNAME' AS "SITENAME",
    t1.data->>'CELLID' AS "CELLID",
    t1.data->>'CELLNAME' AS "CELLNAME",
    t1.data->>'LOCELL' AS "CI",
    CASE 
    	WHEN t1.data->>'CELLID' = t6.data->>'CELLID' THEN 'Activated'
	ELSE 'Not ACTIVATED' 
    END AS "ACT_STATUS",
    CASE 
        WHEN t1.data->>'CELLID' = t7.data->>'CELLID' THEN 'Blocked'
        ELSE 'Not Blocked' 
    END AS "BLKSTATUS",
    NULL AS "DLBANDWIDTH",
    t1.data->>'BANDIND' AS "BAND",
   NULL AS "CARR",
   t1.data->>'UARFCNDOWNLINK' AS "DLF",
   t1.data->>'UARFCNUPLINK' AS "ULF",
   t5.data->>'MCC' AS "MCC",
   t5.data->>'MNC' AS "MNC",
   hex_to_int(REPLACE(t1.data->>'LAC','H''','')) AS "LAC",
   hex_to_int(REPLACE(t1.data->>'RAC','H''','')) AS "RAC",
   CONCAT(t5.data->>'MCC', '-', t5.data->>'MNC', '-', hex_to_int(REPLACE(t1.data->>'LAC','H''','')), '-', t1.data->>'LOCELL') AS "CGI" ,
   NULL AS "2G_BCCHNO",
   NULL AS "2G_BSIC",
   NULL AS "2G_TRX",
   t1.data->>'PSCRAMBCODE' AS "3G_PSC",
   NULL AS "3G_DLCE",
   NULL AS "3G_ULCE",
   NULL AS "4G_PCI",
   NULL AS "4G_TAC",
   NULL AS "4G_ROOTIDX"
FROM 
huawei_cm."UCELL" t1 --where t1.data->>'FILENAME' LIKE 'CFGMML%'
INNER JOIN huawei_cm."SYS" t2 ON t1.data->>'FILENAME' = t2.data->>'FILENAME' 
    AND t1.data->>'BSCID'=t2.data->>'BSCID'
INNER JOIN huawei_cm."UNODEB" t3 ON t1.data->>'FILENAME' = t3.data->>'FILENAME' 
    AND t1.data->>'NODEBNAME'=t3.data->>'NODEBNAME'
INNER JOIN huawei_cm."UCNOPERATOR" t5 ON t5.data->>'FILENAME' = t1.data->>'FILENAME'
LEFT JOIN huawei_cm."UCELL_ACT" t6 ON t1.data->>'FILENAME' = t6.data->>'FILENAME' 
    AND t1.data->>'CELLID' = t6.data->>'CELLID'
LEFT JOIN huawei_cm."UCELL_BLK" t7 ON t1.data->>'FILENAME' = t7.data->>'FILENAME' 
    AND t1.data->>'CELLID' = t7.data->>'CELLID'
UNION
--KEY PARAMETERS 3G Huawei NBI
SELECT
    t1.data->>'varDateTime' AS "DATETIME",
    NULL AS "STATE",
    NULL AS "REGIONAL",
    'HUAWEI' AS "VENDOR",
    '3G' AS "TECH",
    t2.data->>'SYSOBJECTID' AS "NENAME",
    t1.data->>'neid' AS "NEID",
    NULL AS "SITEPROP LAT",
    NULL AS "SITEPROP LON",
    t3.data->>'NODEBID' AS "SITE  ID",
    t1.data->>'NODEBNAME' AS "SITENAME",
    t1.data->>'CELLID' AS "CELLID",
    t1.data->>'CELLNAME' AS "CELLNAME",
    t1.data->>'LOCELL' AS "CI",
    CASE 
        WHEN t1.data->>'ACTSTATUS'='1' THEN 'Activated'
	ELSE 'Not  Activated'
    END AS "ACTSTATUS",
    CASE 
	WHEN t1.data->>'BLKSTATUS'='1' THEN 'Blocked'
	ELSE 'Not Blocked'
    END AS "BLKSTATUS",
    NULL AS "DLBANDWIDTH",
    t1.data->>'BANDIND' AS "BAND",
    NULL AS "CARR",
    t1.data->>'UARFCNDOWNLINK' AS "DLF",
    t1.data->>'UARFCNUPLINK' AS "ULF",
    t5.data->>'MCC' AS "MCC",
    t5.data->>'MNC' AS "MNC",
    (t1.data->>'LAC')::INTEGER AS "LAC",
    (t1.data->>'RAC')::INTEGER AS "RAC",
    CONCAT(t5.data->>'MCC', '-', t5.data->>'MNC', '-', t1.data->>'LAC', '-', t1.data->>'LOCELL') AS "CGI" ,
    NULL AS "2G_BCCHNO",
    NULL AS "2G_BSIC",
    NULL AS "2G_TRX",
    t1.data->>'PSCRAMBCODE' AS "3G_PSC",
    NULL AS "3G_DLCE",
    NULL AS "3G_ULCE",
    NULL AS "4G_PCI",
    NULL AS "4G_TAC",
    NULL AS "4G_ROOTIDX"
FROM 
huawei_cm."UCELL" t1 --where t1.data->>'FILENAME' LIKE 'UNBI%'
INNER JOIN huawei_cm."SYS" t2 ON t1.data->>'FileName' = t2.data->>'FileName' 
    AND t1.data->>'neid' = t2.data->>'neid'
INNER JOIN huawei_cm."UNODEB" t3 ON  t1.data->>'FileName' = t3.data->>'FileName' 
    AND t1.data->>'NODEBNAME' = t3.data->>'NODEBNAME'
INNER JOIN huawei_cm."UCNOPERATOR" t5 ON t5.data->>'FileName' = t1.data->>'FileName'
UNION
--KEY PARAMETERS (2G Huawei CFGMML)
SELECT
    t1.data->>'DATETIME' AS "DATETIME",
    NULL AS "STATE",
    NULL AS "REGIONAL",
    'HUAWEI' AS "VENDOR",
    '2G' AS "TECH",
    t2.data->>'SYSOBJECTID' AS "NENAME",
    t1.data->>'BSCID' AS "NEID",
    NULL AS "SITEPROP LAT",
    NULL AS "SITEPROP LON",
    t1.data->>'BTSID' AS "SITE  ID",
    NULL AS "SITENAME",
    t1.data->>'CELLID' AS "CELLID",
    t1.data->>'CELLNAME' AS "CELLNAME",
    t1.data->>'CI' as "CI",
    NULL AS "ACTSTATUS",
    NULL AS "BLKSTATUS",
    NULL AS "DLBANDWIDTH",
    t1.data->>'BANDIND' AS "BAND",
    NULL AS "CARR",
    NULL AS "DLF",
    NULL AS "ULF",
    t1.data->>'MCC' AS "MCC",
    t1.data->>'MNC' AS "MNC",
    (t1.data->>'LAC')::INTEGER AS "LAC",
    '0' AS "RAC",
    CONCAT(t1.data->>'MCC', '-', t1.data->>'MNC', '-', t1.data->>'LAC', '-', t1.data->>'CI') AS "CGI" ,
    t4.data->>'FREQ' AS "2G_BCCHNO",
    CONCAT(t1.data->>'NCC', t1.data->>'BCC') AS "2G_BSIC",
    NULL AS "2G_TRX",
    NULL AS "3G_PSC",
    NULL AS "3G_DLCE",
    NULL AS "3G_ULCE",
    NULL AS "4G_PCI",
    NULL AS "4G_TAC",
    NULL AS "4G_ROOTIDX"
FROM 
huawei_cm."GCELL" t1 
INNER JOIN huawei_cm."SYS" t2 ON t1.data->>'FILENAME' = t2.data->>'FILENAME' 
    AND t1.data->>'BSCID' = t2.data->>'BSCID'
INNER JOIN huawei_cm."GTRX" t4 ON t1.data->>'CELLID' = t4.data->>'CELLID' 
    AND t1.data->>'BSCID' = t4.data->>'BSCID' 
UNION
--KEY PARAMETERS (4G Bulk_CM)
SELECT
    t1.data->>'DATETIME' AS "DATETIME",
    NULL AS "STATE",
    NULL AS "REGIONAL",
    'ZTE' AS "VENDOR",
    '4G' AS "TECH",
    t1.data->>'SubNetwork_id' AS "NENAME",
    t1.data->>'SubNetwork_2_id' AS "NEID",
    t1.data->>'latitude' AS "SITEPROP LAT",
    t1.data->>'longitude' AS "SITEPROP LON",
    t1.data->>'ENBFunction_id' AS "SITE  ID",
    t2.data->>'enbName' AS "SITENAME",
    CONCAT(t1.data->>'ENBFunction_id',t1.data->>'EUtranCellFDD_id') AS "CELLID",
    t1.data->>'userLabel' AS "CELLNAME",
    t1.data->>'EUtranCellFDD_id' AS "CI",
    NULL AS "ACTSTATUS",
    NULL AS "BLKSTATUS",
    t1.data->>'bandWidthDl' AS "DLBANDWIDTH",
    t1.data->>'freqBandInd' AS "BAND",
    NULL AS "CARR",
    t1.data->>'earfcnDl' AS "DLF",
    t1.data->>'earfcnUl' AS "ULF",
    '0' AS "MCC",
    '0' AS "MNC",
    '0' AS "LAC",
    '0' AS "RAC",
    '0' AS "CGI" ,
    NULL AS "2G_BCCHNO",
    NULL AS "2G_BSIC",
    NULL AS "2G_TRX",
    NULL AS "3G_PSC",
    NULL AS "3G_DLCE",
    NULL AS "3G_ULCE",
    t1.data->>'pci' AS "4G_PCI",
    t1.data->>'tac' AS "4G_TAC",
    NULL AS "4G_ROOTIDX"
FROM zte_cm."EUtranCellFDD" t1
inner join zte_cm."ENBFunction" t2 ON t1.data->>'FILENAME'=t2.data->>'FILENAME' 
    AND t1.data->>'SubNetwork_id' = t2.data->>'SubNetwork_id' 
    AND t1.data->>'ENBFunction_id' = t2.data->>'ENBFunction_id'
`

const NETWORK_CELLS = `
-- Ericsson 2G
SELECT 
	t1.data->>'DATETIME' AS "DATETIME", 
	'ERICSSON' as "VENDOR",
	'3G' AS "TECH",
    t1.data->>'CI' AS "CELLID",
    t1.data->>'CELL_NAME' AS "CELLNAME"
FROM ericsson_cm."INTERNAL_CELL" t1
UNION
-- Ericsson 3G Cells
SELECT 
	t1.data->>'DATETIME' AS "DATETIME", 
	'ERICSSON' as "VENDOR",
	'3G' AS "TECH",
	t1.data->>'cId' AS "CELLID",
    t1.data->>'userLabel' AS "CELLNAME"
FROM ericsson_cm."UtranCell" t1
UNION
-- Ericsson 4G
SELECT 
	t1.data->>'DATETIME' AS "DATETIME", 
	'ERICSSON' as "VENDOR",
	'4G' AS "TECH",
	-- (256 * (t1.data->>'ENODEBID')::INTEGER + (t1.data->>'CellID')::INTEGER)::text AS "CELLID",
	t1.data->>'cellId' AS "CELLID",
    t1.data->>'EUtranCellFDD_id' AS "CELLNAME"
FROM 
    ericsson_cm."EUtranCellFDD" t1
UNION
-- Huawei 2G
SELECT 
    t1.data->>'DATETIME' AS "DATETIME",
    'HUAWEI' as "VENDOR",
	'2G' AS "TECH",
    t1.data->>'CI' AS "CELLID",
    t1.data->>'CELLNAME' AS "CELLNAME"
FROM 
    huawei_cm."GCELL" t1
UNION
-- Huawei 3G Cells
SELECT 
    t1.data->>'DATETIME' AS "DATETIME",
    'HUAWEI' as "VENDOR",
	'3G' AS "TECH",
    t1.data->>'CELLID' AS "CELLID",
    t1.data->>'CELLNAME' AS "CELLNAME"
FROM 
huawei_cm."UCELL" t1
UNION
-- Huawei 4G Cells
SELECT 
    t1.data->>'DATETIME' AS "DATETIME",
    'HUAWEI' as "VENDOR",
	'4G' AS "TECH",
    t1.data->>'CELLID' AS "CELLID",
    t1.data->>'CELLNAME' AS "CELLNAME"
FROM 
huawei_cm."CELL" t1
UNION
-- ZTE 2G Cells
SELECT 
    t1.data->>'DateTime' AS "DATETIME",
    'ZTE' as "VENDOR",
	'2G' AS "TECH",
    t1.data->>'cellIdentity' AS "CELLID",
    t1.data->>'userLabel' AS "CELLNAME"
FROM 
zte_cm."GsmCell" t1
UNION
-- ZTE 3G Cells
SELECT 
    t1.data->>'DateTime' AS "DATE TIME",
    'ZTE' as "VENDOR",
	'3G' AS "TECH",
    t1.data->>'cid' AS "CELLID",
    t1.data->>'userLabel' AS "CELLNAME"
FROM 
zte_cm."UtranCellFDD" t1
UNION
-- ZTE 4G Cells
SELECT 
    t1.data->>'DateTime' AS "DATE TIME",
    'ZTE' as "VENDOR",
	'4G' AS "TECH",
    t1.data->>'cId' AS "CELLID",
    t1.data->>'userLabel' AS "CELLNAME"
FROM 
zte_cm."EUtranCellFDD" t1
UNION
-- Nokia 2G Cells
SELECT
		t1.data->>'DATETIME' AS "DATETIME", 
		'NOKIA' as "VENDOR",
	    '2G' AS "TECH",
		t1.data->>'cellId' AS "CELLID",
		t1.data->>'name' AS "CELLNAME"

FROM nokia_cm."BTS" t1
UNION
-- Nokia 3G Cells
SELECT
		t1.data->>'DATETIME' AS "DATETIME", 
		'NOKIA' as "VENDOR",
	    '3G' AS "TECH",
		t1.data->>'CId' AS "CELLID",
		t1.data->>'name' AS "CELLNAME"

FROM nokia_cm."WCEL" t1
UNION
-- Nokia 4G Cells
SELECT
		t1.data->>'DATETIME' AS "DATETIME", 
		'NOKIA' as "VENDOR",
	    '4G' AS "TECH",
		t1.data->>'phyCellId' AS "CELLID",
		t1.data->>'name' AS "CELLNAME"

FROM nokia_cm."LNBTS" t1
`

const NETWORK_SITES = `
-- Ericsson 2G Sites
SELECT 
    'ERICSSON' as "VENDOR",
    '2G' AS "TECH",
    t1.data->>'SITE_NAME' AS "SITENAME"
from ericsson_cm."SITE" t1
UNION
-- Ericsson 3G Sites
SELECT 
    'ERICSSON' as "VENDOR",
    '3G' AS "TECH",
t1.data->>'MeContext_id' AS "SITENAME"
FROM
ericsson_cm."NodeBFunction" t1
UNION
-- Ericsson 4G 
SELECT 
    'ERICSSON' as "VENDOR",
    '4G' AS "TECH",
    t1.data->>'MeContext_id' AS "SITENAME"
FROM ericsson_cm."ENodeBFunction" t1
UNION 
-- Huawei 4G 
 SELECT 
    'HUAWEI' as "VENDOR",
    '4G' AS "TECH",
    t1.data->>'ENODEBFUNCTIONNAME' AS "SITENAME"
 FROM
 huawei_cm."ENODEBFUNCTION" t1
 -- Huawei 2G
 UNION 
 SELECT 
    'HUAWEI' as "VENDOR",
    '2G' AS "TECH",
    t1.data->>'BTSNAME' AS "SITENAME"
from huawei_cm."BTS" t1
UNION 
-- Huawei 3G 
SELECT 
    'HUAWEI' as "VENDOR",
    '3G' AS "TECH",
    t1.data->>'NODEBNAME' AS "SITENAME"
from huawei_cm."UNODEB" t1
UNION
-- ZTE 4G 
 SELECT 
    'ZTE' as "VENDOR",
    '4G' AS "TECH",
    t1.data->>'userLabel' AS "SITENAME"
    FROM
 zte_cm."ENBFunction" t1
UNION
 -- ZTE 2G (BULK_CM)
 SELECT 
    'ZTE' as "VENDOR",
    '2G' AS "TECH",
t1.data->>'userLabel' AS "SITENAME"
from zte_cm."BtsSiteManager" t1
UNION 
-- ZTE 2G (xls)
 SELECT 
    'ZTE' as "VENDOR",
    '2G' AS "TECH",
t1.data->>'userLabel' AS "SITENAME"
from zte_cm."SiteBaseBandShare" t1
UNION 
-- ZTE 3G (BULK_CM)
SELECT 
    'ZTE' as "VENDOR",
    '3G' AS "TECH",
    t1.data->>'userLabel' AS "SITENAME"
from zte_cm."ManagedElement" t1 where t1.data->>'NODEBID' is not null
UNION
-- Nokia 4G 
 SELECT 
     'NOKIA' as "VENDOR",
    '4G' AS "TECH",
    TRIM(t1.data->>'name') AS "SITENAME"
 FROM
 nokia_cm."LNBTS" t1
 UNION
 -- Nokia 2G 
 SELECT
    'NOKIA' as "VENDOR",
    '2G' AS "TECH",
    CONCAT(TRIM(t1.data->>'name'),'(',TRIM(t1.data->>'lapdLinkName'),')') AS "SITENAME"
FROM nokia_cm."BCF" t1
UNION
-- Nokia 3G
SELECT 
    'NOKIA' as "VENDOR",
    '3G' AS "TECH",
    TRIM(t1.data->>'name' ) AS "SITENAME"
FROM
nokia_cm."WBTS" t1
UNION
-- Motorola 2G
SELECT
   'MOTOROLA' as "VENDOR",
   '2G' as "TECH",
   t1.data->>'site_name' as "SITENAME"
FROM
motorola_cm."cell_x_export" t1 where t1.data->>'bsic' is not null
`

const NETWORK_NODES = `
SELECT
    'HUAWEI' AS "VENDOR",
    t1.data->>'SYSOBJECTID' as "NODENAME"
FROM huawei_cm."SYS" t1
UNION
SELECT
    'NOKIA' AS "VENDOR",
    t1.data->>'name' as "NODENAME"
FROM nokia_cm."BSC" t1
UNION
SELECT
    'NOKIA' AS "VENDOR",
    t1.data->>'name' as "NODENAME"
from nokia_cm."RNC" t1
UNION 
SELECT 
    'ZTE' as "VENDOR",
    t1.data->>'userLabel' AS "NODENAME"
FROM zte_cm."SubNetwork_2" t1
UNION
SELECT 
    'ERICSSON' AS "VENDOR",
    t1.data->>'MeContext_id' AS "SITENAME" 
FROM ericsson_cm."RncFunction" t1
union
select
    'MOTOROLA' AS "VENDOR",
    t1.data->>'bss_name' AS "NODENAME"
FROM motorola_cm."cell_x_export" t1

`;

const NETWORK_RELATIONS = `
--HUAWEI 3G3G RELATIONS 
select 
'Huawei' as "SRV  VENDOR",
'3G' as "SRV TECH",
hex_to_int(REPLACE(t3.data->>'LAC','H''','')) as "SRV LAC",
t1.data->>'CELLID' as "SRV  CELLID",
t3.data->>'CELLNAME' as "SRV  CELLNAME",
'3G' as "NBR TECH",
hex_to_int(REPLACE(t2.data->>'LAC','H''','')) as "NBR LAC", 
(t1.data->>'NCELLID')::INTEGER as "NBR CELLID",
t2.data->>'CELLNAME' as "NBR CELLNAME"
from huawei_cm."UINTRAFREQNCELL" t1
inner join huawei_cm."UCELL" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'NCELLID'= t2.data->>'CELLID' and t1.data->>'RNCID' = t1.data->>'NCELLRNCID'
inner join huawei_cm."UCELL" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->>'CELLID'= t3.data->>'CELLID'
union
--HUAWEI 3G3G EXT RELATIONS
select
'Huawei' as "SRV  VENDOR",
'3G' as "SRV TECH",
hex_to_int(REPLACE(t5.data->>'LAC','H''','')) as "SRV LAC",
t3.data->>'CELLID'as "SRV  CELLID",
t5.data->>'CELLNAME' as "SRV  Cell Name",
'3G' as "NBR TECH",
hex_to_int(REPLACE(t4.data->>'LAC','H''','')) as "NBR LAC",
(t3.data->>'NCELLID')::INTEGER as "NBR CELLID" ,
t4.data->>'CELLNAME' as "NBR Cellname"
from huawei_cm."UINTRAFREQNCELL" t3
inner join huawei_cm."UEXT3GCELL" t4 on t3.data->>'FILENAME'=t4.data->>'FILENAME' and t3.data->>'NCELLID' = t4.data->>'CELLID' and t3.data->>'RNCID' <> t4.data->>'NRNCID'
inner join huawei_cm."UCELL" t5 on t3.data->>'FILENAME'=t5.data->>'FILENAME' and t3.data->>'CELLID'= t5.data->>'CELLID'
union
--ZTE 3G3G RELATIONS
select
'ZTE' as "SRV  Vendor",
'3G' as "SRV TECH",
(t3.data->>'refULocationArea')::INTEGER as "SRV LAC",
t1.data->>'cid' as "SRV  CELLID",
t3.data->>'userLabel' as "SRV  Cell Name",
'3G' as "NBR TECH",
(t2.data->>'refULocationArea')::INTEGER as "NBR LAC",
(t1.data->>'ncid')::INTEGER as "NBR CELLID" ,
t2.data->>'userLabel' as "NBR Cellname"
from zte_cm."UtranRelation" t1
--neighbour cell name
inner join zte_cm."UtranCellFDD" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'DataType'=t2.data->>'DataType' and t2.data->>'cid' = t1.data->>'ncid' and t2.data->>'rncid' = t1.data->>'nrncid'
--serving cell name
inner join zte_cm."UtranCellFDD" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->>'DataType'=t3.data->>'DataType' and t3.data->>'cid' = t1.data->>'cid'
union
--ZTE 3G3G EXT RELATIONS
select
'ZTE' as "SRV  Vendor",
'3G' as "SRV TECH",
(t3.data->>'refULocationArea')::INTEGER as "SRV  LAC",
t1.data->>'cid' as "SRV  CELLID",
t3.data->>'userLabel' as "SRV  Cell Name",
'3G' as "NBR TECH",
(t2.data->>'lac')::INTEGER as "NBR LAC",
(t1.data->>'ncid')::INTEGER as "NBR CELLID",
t2.data->>'userLabel' as "NBR Cellname"
from zte_cm."UtranRelation" t1
inner join zte_cm."ExternalUtranCellFDD" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'DataType'=t2.data->>'DataType' and t2.data->>'rncid' = t1.data->>'rncid' and t2.data->>'nrncId' = t1.data->>'nrncid' and t2.data->>'ncId' = t1.data->>'ncid' and t1.data->>'rncid' <> t1.data->>'nrncid'
inner join zte_cm."UtranCellFDD" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->>'DataType'=t3.data->>'DataType' and t3.data->>'cid' = t1.data->>'cid'
UNION
--Huawei (CGFMML) 3G2G RELATIONS
SELECT
'HUAWEI' as "SRV VENDOR",
'3G' as "SRV TECH",
hex_to_int(REPLACE(t2.data->>'LAC','H''','')) AS "SRV LAC",
t1.data->>'CELLID' AS "SRV CELLID",
t2.data->>'CELLNAME' as "SRV CELLNAME",
'2G' as "NBR TECH",
hex_to_int(REPLACE(t3.data->>'LAC','H''','')) AS "NBR LAC",
hex_to_int(REPLACE(t3.data->>'CID','H''','')) AS "NBR CI",
t3.data->>'GSMCELLNAME' as "NBR Cellname"
from huawei_cm."U2GNCELL" t1
INNER JOIN huawei_cm."UCELL" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'BSCID'=t2.data->>'BSCID' and t1.data->>'CELLID'=t2.data->>'CELLID'
INNER JOIN huawei_cm."UEXT2GCELL" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t3.data->>'BSCID'=t3.data->>'BSCID' and t1.data->>'GSMCELLINDEX'=t3.data->>'GSMCELLINDEX' 
UNION
--Huawei (NBI) 3G2G RELATIONS
SELECT
'HUAWEI' as "SRV VENDOR",
'3G' as "SRV TECH",
(t2.data->>'LAC')::INTEGER AS "SRV LAC",
t1.data->>'CELLID' AS "SRV CELLID",
t2.data->>'CELLNAME' as "SRV CELLNAME",
'2G' as "NBR TECH",
(t3.data->>'LAC')::INTEGER AS "NBR LAC",
(t3.data->>'CID')::INTEGER AS "NBR CI",
t3.data->>'GSMCELLNAME' as "NBR Cellname"
from huawei_cm."U2GNCELL" t1
INNER JOIN huawei_cm."UCELL" t2 on t1.data->>'FileName'=t2.data->>'FileName' and t1.data->>'neid'=t2.data->>'neid' and t1.data->>'CELLID'=t2.data->>'CELLID'
INNER JOIN huawei_cm."UEXT2GCELL" t3 on t1.data->>'FileName'=t3.data->>'FileName' and t3.data->>'neid'=t3.data->>'neid' and t1.data->>'GSMCELLINDEX'=t3.data->>'GSMCELLINDEX' 
UNION
--ZTE (XLS) 3G2G RELATIONS
SELECT
'ZTE' as "SRV VENDOR",
'3G' as "SRV TECH",
(t2.data->>'refULocationArea')::INTEGER  AS "SRV LAC",
t1.data->>'cid' AS "SRV CELLID",
t2.data->>'userLabel' as "SRV CELLNAME",
'2G' as "NBR TECH",
(t1.data->>'lac')::INTEGER AS "NBR LAC",
(t1.data->>'cellIdentity')::INTEGER AS "NBR CI",
t1.data->>'userLabel' as "NBR Cellname"
from zte_cm."GsmRelation" t1
INNER JOIN zte_cm."UtranCellFDD" t2 on t1.data->>'FileName'=t2.data->>'FileName' and t1.data->>'DataType'=t2.data->>'DataType' and t1.data->>'rncid'=t2.data->>'rncid' and t1.data->>'cid'=t2.data->>'cid'
UNION
--Motorola 2G2G Relations
SELECT
'MOTOROLA' AS "SRV VENDOR",
'2G' as "SRV TECH",
(t1.data->>'source_lac')::INTEGER AS "SRV LAC",
t1.data->>'source_ci' AS "SRV CELL ID",
null as "SRV CELLNAME",
'2G' as "NBR TECH",
(t1.data->>'dest_lac')::INTEGER AS "NBR LAC",
(t1.data->>'dest_ci')::INTEGER AS "NBR CELL ID",
null as "NBR CELLNAME"
FROM motorola_cm."cell_x_export" t1 where t1.data->>'dest_bsic' is not null
UNION
--Huawei 2G2G Relations 
SELECT
'Huawei' as "SRV VENDOR",
'2G' as "SRV TECH",
(t2.data->>'LAC')::INTEGER as "SRV LAC",
t2.data->>'CI' as "SRV CELL ID",
t2.data->>'CELLNAME' as "SRV CELLNAME",
'2G' as "NBR TECH",
(t3.data->>'LAC')::INTEGER as "NBR LAC",
(t3.data->>'CI')::INTEGER as "NBR CELL ID",
t3.data->>'CELLNAME' as "NBR CELLNAME"
FROM huawei_cm."G2GNCELL" t1
INNER JOIN huawei_cm."GCELL" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'SRC2GNCELLID'=t2.data->>'CELLID'
INNER JOIN huawei_cm."GCELL" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->>'NBR2GNCELLID'=t3.data->>'CELLID'  
UNION
--Huawei 2G2G Ext Relations
SELECT
'Huawei' as "SRV VENDOR",
'2G' as "SRV TECH",
(t2.data->>'LAC')::INTEGER as "SRV LAC",
t2.data->>'CI' as "SRV CELL ID",
t2.data->>'CELLNAME' as "SRV CELLNAME",
'2G' as "NBR TECH",
(t3.data->>'LAC')::INTEGER as "NBR LAC",
(t3.data->>'CI')::INTEGER as "NBR CELL ID",
t3.data->>'EXT2GCELLNAME' as "NBR CELLNAME"
FROM huawei_cm."G2GNCELL" t1
INNER JOIN huawei_cm."GCELL" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'SRC2GNCELLID'=t2.data->>'CELLID'
INNER JOIN huawei_cm."GEXT2GCELL" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->>'NBR2GNCELLID'=t3.data->>'EXT2GCELLID'
UNION
--ZTE 2G-2G RELATIONS (xls)
SELECT 
'ZTE' as "SRV VENDOR",
'2G' as "SRV TECH",
(REGEXP_REPLACE(t2.data->>'refGLocationArea','\\d+,\\d+,(\\d+),\\d+','\\1'))::INTEGER AS "SRV LAC",
t2.data->>'cellIdentity' as "SRV CELL ID",
t2.data->>'userLabel' as "SRV CELLNAME",
'2G' as "NBR TECH",
(REGEXP_REPLACE(t1.data->>'RELATIONCGI','\\d+,\\d+,(\\d+),\\d+','\\1'))::INTEGER AS "NBR LAC",
(REGEXP_REPLACE(t1.data->>'RELATIONCGI','\\d+,\\d+,\\d+,(\\d+)','\\1'))::INTEGER AS "NBR CI",
t1.data->>'userLabel' as "NBR CELLNAME"
FROM zte_cm."GsmRelation" t1
INNER JOIN zte_cm."GsmCell" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'DataType'=t2.data->>'DataType' and t1.data->>'MEID'=t2.data->>'MEID' and t1.data->>'GGsmCellId'=t2.data->>'GGsmCellId' and t1.data->>'GBtsSiteManagerId'=t2.data->>'GBtsSiteManagerId' and t1.data->>'DataType'= t2.data->>'DataType'
UNION
--ZTE 2G-2G RELATIONS (Bulk_CM) Own Neighbours
SELECT
'ZTE' AS "SRV VENDOR",
'2G' AS "SRV TECH",
(t2.data->>'lac')::INTEGER AS "SRV LAC",
t2.data->>'cellIdentity' as "SRV CELL ID",
t2.data->>'userLabel' as "SRV CELLNAME",
'2G' as "NBR TECH",
(t3.data->>'lac')::INTEGER AS "NBR LAC",
(t3.data->>'cellIdentity')::INTEGER as "NBR CELL ID",
t3.data->>'userLabel' as "NBR CELLNAME"
from zte_cm."GsmRelation" t1
-- Serving Cell
INNER JOIN zte_cm."GsmCell" t2 
    on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'DataType'=t2.data->>'DataType' and t1.data->>'BssFunction_id'=t2.data->>'BssFunction_id' and t1.data->>'BtsSiteManager_id'=t2.data->>'BtsSiteManager_id' 
    and t1.data->>'GsmCell_id'=t2.data->>'GsmCell_id'
-- Nbr Cell
INNER JOIN zte_cm."GsmCell" t3 
    ON t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->>'DataType'=t3.data->>'DataType' and t1.data->>'adjacentCell' = CONCAT('"SubNetwork=', t3.data->>'SubNetwork_id', ',SubNetwork=',t3.data->>'SubNetwork_2_id', ',MeContext=', t3.data->>'meContext_id', ',ManagedElement=', t3.data->>'ManagedElement_id', ',BssFunction=', t3.data->>'BssFunction_id', ',BtsSiteManager=', t3.data->>'BtsSiteManager_id', ',GsmCell=', t3.data->>'GsmCell_id','"')
UNION
--Huawei 2G3G Relations (CFGMML)
SELECT 
'HUAWEI' AS "SRV VENDOR",
'2G' AS "SRV TECH",
(t2.data->>'LAC')::INTEGER AS "SRV LAC",
t2.data->>'CI' AS "SRV CI",
t2.data->>'CELLNAME' AS "SRV CELLNAME",
'3G' AS "NBR TECH",
(t3.data->>'LAC')::INTEGER AS "NBR LAC",
(t3.data->>'CI')::INTEGER AS "NBR CI",
t3.data->>'EXT3GCELLNAME' AS "NBR CELLNAME"
FROM huawei_cm."G3GNCELL" t1
INNER JOIN huawei_cm."GCELL" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'SRC3GNCELLID'=t2.data->>'CELLID'
INNER JOIN huawei_cm."GEXT3GCELL" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->>'NBR3GNCELLID'=t3.data->>'EXT3GCELLID'
UNION
--ZTE 2G3G Relations (xls)
SELECT
'ZTE' AS "SRV VENDOR",
'2G' AS "SRV TECH",
(REGEXP_REPLACE(t2.data->>'refGLocationArea','\\d+,\\d+,(\\d+),\\d+','\\1'))::INTEGER AS "SRV LAC",
t2.data->>'cellIdentity' as "SRV CELL ID",
t2.data->>'userLabel' AS "SRV CELLNAME",
'3G' AS "NBR TECH",
(t3.data->>'lac')::INTEGER AS "NBR LAC",
(REGEXP_REPLACE(t1.data->>'RELATIONCGI','\\d+,\\d+,\\d+,(\\d+)','\\1'))::INTEGER AS "NBR CI",
t3.data->>'userLabel' AS "NBR CELLNAME"
FROM zte_cm."UtranRelation" t1
INNER JOIN zte_cm."GsmCell" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'MEID'=t2.data->>'MEID'	and t1.data->>'GBtsSiteManagerId'=t2.data->>'GBtsSiteManagerId'	and t1.data->>'GGsmCellId'=t2.data->>'GGsmCellId'
INNER JOIN zte_cm."ExternalUtranCellFDD" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->'DataType'=t3.data->'DataType'and t1.data->>'MEID'=t3.data->>'MEID' and REGEXP_REPLACE(t1.data->>'RELATIONCGI','\\d+,\\d+,(\\d+),\\d+','\\1')=t3.data->>'rnc_id'and REGEXP_REPLACE(t1.data->>'RELATIONCGI','\\d+,\\d+,\\d+,(\\d+)','\\1')=t3.data->>'ci'
UNION
--Motorola 2G3G Relations
SELECT
'MOTOROLA' AS "SRV VENDOR",
'2G' as "SRV TECH",
(t1.data->>'source_lac')::INTEGER AS "SRV LAC",
t1.data->>'source_ci' AS "SRV CELL ID",
null as "SRV CELLNAME",
'3G' as "NBR TECH",
(t1.data->>'dest_lac')::INTEGER AS "NBR LAC",
(t1.data->>'dest_ci')::INTEGER AS "NBR CELL ID",
null as "NBR CELLNAME"
FROM motorola_cm."cell_x_export" t1 where t1.data->>'dest_rnc_id' is not null
`;
const NETWORK_3G3G_RELATIONS = `
--HUAWEI 3G3G RELATIONS 
select 
'Huawei' as "SRV  Vendor",
t1.data->>'RNCID' as "SRV  RNCID",
t1.data->>'CELLID' as "SRV  CELLID",
t6.data->>'CELLNAME' as "SRV  Cell Name",
t1.data->>'NCELLRNCID' as "NBR CELL RNCID", 
t1.data->>'NCELLID' as "NBR CELLID",
t2.data->>'CELLNAME' as "NBR cell name"
from huawei_cm."UINTRAFREQNCELL" t1
inner join huawei_cm."UCELL" t2 on t1.data->>'NCELLID'= t2.data->>'CELLID' and t1.data->>'RNCID' = t1.data->>'NCELLRNCID'
inner join huawei_cm."UCELL" t6 on t1.data->>'CELLID'= t6.data->>'CELLID'
union
--HUAWEI 3G3G EXT RELATIONS
select
'Huawei' as "SRV  Vendor",
t3.data->>'RNCID' as "SRV  RNCID",
t3.data->>'CELLID'as "SRV  CELLID",
t5.data->>'CELLNAME' as "SRV  Cell Name",
t3.data->>'NCELLRNCID' as "NBR CELL RNCID",
t3.data->>'NCELLID' as "NBR CELLID" ,
t4.data->>'CELLNAME' as "NBR Cellname"
from huawei_cm."UINTRAFREQNCELL" t3
inner join huawei_cm."UEXT3GCELL" t4 on  t3.data->>'NCELLID' = t4.data->>'CELLID' and t3.data->>'RNCID' <> t4.data->>'NRNCID'
inner join huawei_cm."UCELL" t5 on t3.data->>'CELLID'= t5.data->>'CELLID'
union
--ZTE 3G3G RELATIONS
select
'ZTE' as "SRV  Vendor",
t1.data->>'rncid' as "SRV  RNCID",
t1.data->>'cid' as "SRV  CELLID",
t3.data->>'userLabel' as "SRV  Cell Name",
t1.data->>'nrncid' as "NBR CELL RNCID",
t1.data->>'ncid' as "NBR CELLID" ,
t2.data->>'userLabel' as "NBR Cellname"
from zte_cm."UtranRelation" t1
inner join zte_cm."UtranCellFDD" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'DataType'=t2.data->>'DataType' and t2.data->>'rncid' = t1.data->>'nrncid' and t2.data->>'cid' = t1.data->>'ncid' 
inner join zte_cm."UtranCellFDD" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->>'DataType'=t3.data->>'DataType' and t1.data->>'rncid' = t3.data->>'rncid' and t3.data->>'cid' = t1.data->>'cid'
union
--ZTE 3G3G EXT RELATIONS
select
'ZTE' as "SRV  Vendor",
t1.data->>'rncid' as "SRV  RNCID",
t1.data->>'cid' as "SRV  CELLID",
t3.data->>'userLabel' as "SRV  Cell Name",
t1.data->>'nrncid' as "NBR CELL RNCID",
t1.data->>'ncid' as "NBR CELLID" ,
t2.data->>'userLabel' as "NBR Cellname"
from zte_cm."UtranRelation" t1
inner join zte_cm."ExternalUtranCellFDD" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'DataType'=t2.data->>'DataType' and t2.data->>'rncid' = t1.data->>'rncid' and t2.data->>'nrncId' = t1.data->>'nrncid' and t2.data->>'ncId' = t1.data->>'ncid' and t1.data->>'rncid' <> t1.data->>'nrncid' 
inner join zte_cm."UtranCellFDD" t3 on t2.data->>'FILENAME' = t1.data->>'FILENAME' and t3.data->>'cid' = t1.data->>'cid'
`;

const NETWORK_3G2G_RELATIONS = `
--Huawei (CGFMML) 3G2G RELATIONS
SELECT
'HUAWEI' as "SRV VENDOR",
hex_to_int(REPLACE(t2.data->>'LAC','H''','')) AS "SRV LAC",
t1.data->>'CELLID' AS "SRV CELLID",
hex_to_int(REPLACE(t3.data->>'LAC','H''','')) AS "NBR LAC",
hex_to_int(REPLACE(t3.data->>'CID','H''','')) AS "NBR CI"
from huawei_cm."U2GNCELL" t1
INNER JOIN huawei_cm."UCELL" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'BSCID'=t2.data->>'BSCID' and t1.data->>'CELLID'=t2.data->>'CELLID'
INNER JOIN huawei_cm."UEXT2GCELL" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t3.data->>'BSCID'=t3.data->>'BSCID' and t1.data->>'GSMCELLINDEX'=t3.data->>'GSMCELLINDEX' 
UNION
--Huawei (NBI) 3G2G RELATIONS
SELECT
'HUAWEI' as "SRV VENDOR",
(t2.data->>'LAC')::INTEGER AS "SRV LAC",
t1.data->>'CELLID' AS "SRV CELLID",
(t3.data->>'LAC')::INTEGER AS "NBR LAC",
(t3.data->>'CID')::INTEGER AS "NBR CI"
from huawei_cm."U2GNCELL" t1
INNER JOIN huawei_cm."UCELL" t2 on t1.data->>'FileName'=t2.data->>'FileName' and t1.data->>'neid'=t2.data->>'neid' and t1.data->>'CELLID'=t2.data->>'CELLID'
INNER JOIN huawei_cm."UEXT2GCELL" t3 on t1.data->>'FileName'=t3.data->>'FileName' and t3.data->>'neid'=t3.data->>'neid' and t1.data->>'GSMCELLINDEX'=t3.data->>'GSMCELLINDEX' 
UNION
--ZTE (XLS) 3G2G RELATIONS
SELECT
'ZTE' as "SRV VENDOR",
(t2.data->>'refULocationArea')::INTEGER  AS "SRV LAC",
t1.data->>'cid' AS "SRV CELLID",
(t1.data->>'lac')::INTEGER AS "NBR LAC",
(t1.data->>'cellIdentity')::INTEGER AS "NBR CI"
from zte_cm."GsmRelation" t1
INNER JOIN zte_cm."UtranCellFDD" t2 on t1.data->>'FileName'=t2.data->>'FileName' and t1.data->>'DataType'=t2.data->>'DataType' and t1.data->>'rncid'=t2.data->>'rncid' and t1.data->>'cid'=t2.data->>'cid'
`;

const NETWORK_2G2G_RELATIONS = `
--Motorola 2G2G Relations
SELECT
'MOTOROLA' AS "SRV VENDOR",
t1.data->>'source_lac' AS "SRV LAC",
t1.data->>'source_ci' AS "SRV CELL ID",
t1.data->>'dest_lac' AS "NBR LAC",
t1.data->>'dest_ci' AS "NBR CELL ID"
FROM motorola_cm."cell_x_export" t1 where t1.data->>'dest_bsic' is not null
UNION
--Huawei 2G2G Relations 
SELECT
'Huawei' as "SRV VENDOR",
t2.data->>'LAC' as "SRV LAC",
t2.data->>'CI' as "SRV CELL ID",
t3.data->>'LAC' as "NBR LAC",
t3.data->>'CI' as "NBR CELL ID"
FROM huawei_cm."G2GNCELL" t1
INNER JOIN huawei_cm."GCELL" t2 on t1.data->>'SRC2GNCELLID'=t2.data->>'CELLID'
INNER JOIN huawei_cm."GCELL" t3 on t1.data->>'NBR2GNCELLID'=t3.data->>'CELLID'  
UNION
--Huawei 2G2G Ext Relations
SELECT
'Huawei' as "SRV VENDOR",
t2.data->>'LAC' as "SRV LAC",
t2.data->>'CI' as "SRV CELL ID",
t3.data->>'LAC' as "NBR LAC",
t3.data->>'CI' as "NBR CELL ID"
FROM huawei_cm."G2GNCELL" t1
INNER JOIN huawei_cm."GCELL" t2 on t1.data->>'SRC2GNCELLID'=t2.data->>'CELLID'
INNER JOIN huawei_cm."GEXT2GCELL" t3 on t1.data->>'NBR2GNCELLID'=t3.data->>'EXT2GCELLID'
UNION
--ZTE 2G-2G RELATIONS (xls)
SELECT 
'ZTE' as "SRV VENDOR",
REGEXP_REPLACE(t2.data->>'refGLocationArea','\\d+,\\d+,(\\d+),\\d+','\\1') AS "SRV LAC",
t2.data->>'cellIdentity' as "SRV CELL ID",
REGEXP_REPLACE(t1.data->>'RELATIONCGI','\\d+,\\d+,(\\d+),\\d+','\\1') AS "NBR LAC",
REGEXP_REPLACE(t1.data->>'RELATIONCGI','\\d+,\\d+,\\d+,(\\d+)','\\1') AS "NBR CI"
FROM zte_cm."GsmRelation" t1
INNER JOIN zte_cm."GsmCell" t2 on t1.data->>'MEID'=t2.data->>'MEID' and t1.data->>'GGsmCellId'=t2.data->>'GGsmCellId' and t1.data->>'GBtsSiteManagerId'=t2.data->>'GBtsSiteManagerId' and t1.data->>'DataType'= t2.data->>'DataType'
UNION
--ZTE 2G-2G RELATIONS (Bulk_CM) Own Neighbours
SELECT
'ZTE' AS "SRV VENDOR",
t2.data->>'lac' AS "SRV LAC",
t2.data->>'cellIdentity' as "SRV CELL ID",
t3.data->>'lac' AS "NBR LAC",
t3.data->>'cellIdentity' as "NBR CELL ID"
from zte_cm."GsmRelation" t1
-- Serving Cell
INNER JOIN zte_cm."GsmCell" t2 
    on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'BssFunction_id'=t2.data->>'BssFunction_id' and t1.data->>'BtsSiteManager_id'=t2.data->>'BtsSiteManager_id' 
    and t1.data->>'GsmCell_id'=t2.data->>'GsmCell_id'
-- Nbr Cell
INNER JOIN zte_cm."GsmCell" t3 
    ON t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'adjacentCell' = CONCAT('"SubNetwork=', t3.data->>'SubNetwork_id', ',SubNetwork=',t3.data->>'SubNetwork_2_id', ',MeContext=', t3.data->>'meContext_id', ',ManagedElement=', t3.data->>'ManagedElement_id', ',BssFunction=', t3.data->>'BssFunction_id', ',BtsSiteManager=', t3.data->>'BtsSiteManager_id', ',GsmCell=', t3.data->>'GsmCell_id','"')
`;

const NETWORK_2G3G_RELATIONS = `
--Huawei 2G3G Relations (CFGMML)
SELECT 
'HUAWEI' AS "SRV VENDOR",
t2.data->>'LAC' AS "SRV LAC",
t2.data->>'CI' AS "SRV CI",
t3.data->>'LAC' AS "NBR LAC",
t3.data->>'CI' AS "NBR CI"
FROM huawei_cm."G3GNCELL" t1
INNER JOIN huawei_cm."GCELL" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'SRC3GNCELLID'=t2.data->>'CELLID'
INNER JOIN huawei_cm."GEXT3GCELL" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->>'NBR3GNCELLID'=t3.data->>'EXT3GCELLID'
UNION
--ZTE 2G3G Relations (xls)
SELECT
'ZTE' AS "SRV VENDOR",
REGEXP_REPLACE(t2.data->>'refGLocationArea','\\d+,\\d+,(\\d+),\\d+','\\1') AS "SRV LAC",
t2.data->>'cellIdentity' as "SRV CELL ID",
t3.data->>'lac' AS "NBR LAC",
REGEXP_REPLACE(t1.data->>'RELATIONCGI','\\d+,\\d+,\\d+,(\\d+)','\\1') AS "NBR CI"
FROM zte_cm."UtranRelation" t1
INNER JOIN zte_cm."GsmCell" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'MEID'=t2.data->>'MEID'	and t1.data->>'GBtsSiteManagerId'=t2.data->>'GBtsSiteManagerId'	and t1.data->>'GGsmCellId'=t2.data->>'GGsmCellId'
INNER JOIN zte_cm."ExternalUtranCellFDD" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->'DataType'=t3.data->'DataType'and t1.data->>'MEID'=t3.data->>'MEID' and REGEXP_REPLACE(t1.data->>'RELATIONCGI','\\d+,\\d+,(\\d+),\\d+','\\1')=t3.data->>'rnc_id'and REGEXP_REPLACE(t1.data->>'RELATIONCGI','\\d+,\\d+,\\d+,(\\d+)','\\1')=t3.data->>'ci'
`;

exports.up = (pgm) => {
	pgm.sql(`
INSERT INTO 
	reports.categories (name, notes, parent_id, in_built)
VALUES
	('Key Parameters','Key parameter reports',0, true),
	('Network Entities','Network Entities reports',0, true)
	`);


	pgm.sql(`
INSERT INTO
	reports.reports (name, notes, query, options, type, category_id, in_built)
VALUES
	('2G Parameters','2G parameters', $$${GSM_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('Ericsson 3G parameters','Ericsson 3G parameters', $$${ERICSSON_3G_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('Ericsson 4G parameters','Ericsson 4G parameters', $$${ERICSSON_4G_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('Huawei 2G parameters','Huawei 2G parameters', $$${HUAWEI_2G_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('Huawei 3G parameters','Huawei 3G parameters', $$${HUAWEI_3G_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('Huawei 4G parameters','Huawei 4G parameters', $$${HUAWEI_4G_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('ZTE 2G parameters','ZTE 2G parameters', $$${ZTE_2G_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('ZTE 3G parameters','ZTE 3G parameters', $$${ZTE_3G_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('ZTE 4G parameters','ZTE 4G parameters', $$${ZTE_4G_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('Nokia 2G parameters','Nokia 2G parameters', $$${NOKIA_2G_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('Nokia 3G parameters','Nokia 3G parameters', $$${NOKIA_3G_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('Nokia 4G parameters','Nokia 4G parameters', $$${NOKIA_4G_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('Combined Key Parameters','Combined Key Parameters', $$${COMBINED_KEY_PARAMAETERS}$$, '{}', 'table',1, true),
	('Network Cells','Network Cells', $$${NETWORK_CELLS}$$, '{}', 'table',2, true),
	('Network Sites','Network Sites', $$${NETWORK_SITES}$$, '{}', 'table',2, true),
	('Network Nodes','Network Nodes', $$${NETWORK_NODES}$$, '{}', 'table',2, true),
	('Network Relations','Network Relations', $$${NETWORK_RELATIONS}$$, '{}', 'table',2, true),
	('Network 3G3G Relations','Network 3G3G RELATIONS', $$${NETWORK_3G3G_RELATIONS}$$, '{}', 'table',2, true),
	('Network 3G2G Relations','Network 3G2G RELATIONS', $$${NETWORK_3G2G_RELATIONS}$$, '{}', 'table',2, true),
	('Network 2G2G Relations','Network 2G2G RELATIONS', $$${NETWORK_2G2G_RELATIONS}$$, '{}', 'table',2, true),
	('Network 2G3G Relations','Network 2G3G RELATIONS', $$${NETWORK_2G3G_RELATIONS}$$, '{}', 'table',2, true)
	`,{
		GSM_KEY_PARAMAETERS: GSM_KEY_PARAMAETERS,
		ERICSSON_3G_KEY_PARAMAETERS: ERICSSON_3G_KEY_PARAMAETERS,
		ERICSSON_4G_KEY_PARAMAETERS: ERICSSON_4G_KEY_PARAMAETERS,
		HUAWEI_2G_KEY_PARAMAETERS: HUAWEI_2G_KEY_PARAMAETERS,
		HUAWEI_3G_KEY_PARAMAETERS: HUAWEI_3G_KEY_PARAMAETERS,
		HUAWEI_4G_KEY_PARAMAETERS: HUAWEI_4G_KEY_PARAMAETERS,
		ZTE_2G_KEY_PARAMAETERS : ZTE_2G_KEY_PARAMAETERS,
		ZTE_3G_KEY_PARAMAETERS : ZTE_3G_KEY_PARAMAETERS,
		ZTE_4G_KEY_PARAMAETERS : ZTE_4G_KEY_PARAMAETERS,
		NOKIA_2G_KEY_PARAMAETERS : NOKIA_2G_KEY_PARAMAETERS,
		NOKIA_3G_KEY_PARAMAETERS : NOKIA_3G_KEY_PARAMAETERS,
		NOKIA_4G_KEY_PARAMAETERS : NOKIA_4G_KEY_PARAMAETERS,
		COMBINED_KEY_PARAMAETERS : COMBINED_KEY_PARAMAETERS,
		NETWORK_CELLS : NETWORK_CELLS,
		NETWORK_SITES : NETWORK_SITES,
		NETWORK_NODES : NETWORK_NODES,
		NETWORK_RELATIONS : NETWORK_RELATIONS,
		NETWORK_3G3G_RELATIONS : NETWORK_3G3G_RELATIONS,
		NETWORK_3G2G_RELATIONS : NETWORK_3G2G_RELATIONS,
		NETWORK_2G2G_RELATIONS : NETWORK_2G2G_RELATIONS,
		NETWORK_2G3G_RELATIONS : NETWORK_2G3G_RELATIONS
	})
};

exports.down = (pgm) => {
	pgm.sql("TRUNCATE TABLE reports.reports RESTART IDENTITY CASCADE");
	pgm.sql("TRUNCATE TABLE reports.categories RESTART IDENTITY CASCADE");
};
