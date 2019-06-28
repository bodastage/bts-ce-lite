export const HUAWEI_2G_KEY_PARAMAETERS = `
	SELECT 
	t1.data->>'DATETIME' AS "DATETIME", 
	t2.data->>'SYSOBJECTID' as "NENAME", 
	'HUAWEI' AS "VENDOR", 
	'2G' AS "TECHNOLOGY", 
	t3.data->>'BTSNAME' AS "SITENAME", 
	t3.data->>'BTSID' AS "SITEID", 
	t1.data->>'CELLNAME' AS "CELLNAME", 
	t1.data->>'ACTSTATUS' AS "ACTSTATUS", 
	t1.data->>'ADMSTAT' AS "BLKSTATUS", 
	t1.data->>'MCC' AS "MCC", 
	t1.data->>'MNC' AS "MNC", 
	t1.data->>'LAC' AS "LAC", 
	t1.data->>'CI' AS "CI", 
	t1.data->>'BCCHNO' AS "BCCHNO", 
	t1.data->>'NCC' AS "NCC", 
	t1.data->>'BCC' AS "BCC", 
	CONCAT(t1.data->>'NCC', t1.data->>'BCC') AS "BSIC", 
	CONCAT(t1.data->>'MCC', '-', t1.data->>'MNC', '-', t1.data->>'LAC', '-', t1.data->>'CI') AS "CGI_RAW", 
	CONCAT(t1.data->>'MCC', '-', t1.data->>'MNC', '-', LPAD(t1.data->>'LAC',5,'0'), '-', t1.data->>'CI') AS "CGI" 
	FROM huawei_cm."GCELL" t1 
	INNER JOIN huawei_cm."SYS" t2 ON t1.data->>'FILENAME' = t2.data->>'FILENAME' 
	INNER JOIN huawei_cm."BTS" t3 ON t3.data->>'BTSID' = t1.data->>'BTSID' AND t1.data->>'FILENAME' = t3.data->>'FILENAME' 
`;


export const HUAWEI_3G_KEY_PARAMAETERS = `
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
	-- t1."ADMSTAT" AS "BLKSTATUS", 
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
	INNER JOIN huawei_cm."RNCBASIC" t3 ON t3.data->>'RNCID' = t1.data->>'LOGICRNCID' AND t1.data->>'FILENAME' = t3.data->>'FILENAME' 
	INNER JOIN huawei_cm."NODEBFUNCTION" t4 ON t1.data->>'FILENAME' = t1.data->>'FILENAME' 
	INNER JOIN huawei_cm."CNOPERATOR" t5 ON t5.data->>'FILENAME' = t1.data->>'FILENAME' 
 
`

export const HUAWEI_4G_KEY_PARAMAETERS = `
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

`