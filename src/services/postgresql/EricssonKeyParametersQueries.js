const ERICSSON_2G_KEY_PARAMAETERS = `
WITH QRY_CHANNEL_GROUP_TRX AS (
	SELECT 
		t1.data->>'BSC_NAME' AS "NENAME", 
		t1.data->>'CELL_NAME' AS "CELLNAME", 
		COUNT(t1.data->>'CHGR_NAME') AS NumberOfTRX
	FROM ericsson_cm."CHANNEL_GROUP" t1
	GROUP BY t1.data->>'BSC_NAME', t1.data->>'CELL_NAME'
)
SELECT
   t1.data->>'DATETIME',
   'VIVO' AS "REGIONAL",
   'ERICSSON' AS "VENDOR",
   '2G' AS "TECHNOLOGY",
   'BSC' AS "NETYPE",
   t1.data->>'BSC_NAME' AS "NENAME",
   '' AS "MGW",
--    REPLACE("MODE", " - ACTIVE", "") AS MGC,
   '' AS "MGC_NUM",
   '' AS "CARR",
   SUBSTRING(t1.data->>'CELL_NAME', 2, 3) AS "SITEPROP",
   SUBSTRING(LPAD(t1.data->>'CI', 5, '0'),0, 4) AS "SITEID",
   SUBSTRING(t1.data->>'CELL_NAME', 0, 5) AS "SITENAME",
   t1.data->>'CI' AS "CELLID",
   t1.data->>'CELL_NAME' AS "CELLNAME",
   REPLACE(t1.data->>'CELL_STATE', '"', '') AS "ACTSTATUS",
   '' AS BLKSTATUS,
   REPLACE(t1.data->>'C_SYS_TYPE', 'GSM', '') AS "DLF",
   REPLACE(t1.data->>'C_SYS_TYPE', 'GSM', '') AS "ULF",
   '' AS "DLBANDWIDTH",
   REPLACE(t1.data->>'C_SYS_TYPE', 'GSM', '') AS "BAND",
   t1.data->>'MCC',
   t1.data->>'MNC',
   t1.data->>'LAC',
   '' AS "RAC",		
   t1.data->>'BCCHNO',
   t1.data->>'BCC',
   t1.data->>'NCC',
   t1.data->>'CI',
   CONCAT(t1.data->>'BCC', t1.data->>'NCC') AS "BSIC",
   CONCAT(t1.data->>'MCC', ' - ', LPAD(t1.data->>'MNC', 2, '0'), ' - ', LPAD(t1.data->>'LAC',5 ,'0'), ' - ', LPAD(t1.data->>'CI', 5,'0')) AS "CGI",
   CONCAT(t1.data->>'MCC', ' - ', t1.data->>'MNC', ' - ', t1.data->>'LAC', ' - ', t1.data->>'CI') AS CGI_Raw,
   '' AS "CGI_HEX",
   t3.NumberOfTRX AS TRX_NUM 
FROM ericsson_cm."INTERNAL_CELL" t1 
INNER JOIN ericsson_cm."BSC" t2 ON t1.data->>'BSC_NAME' = t2.data->>'BSC_NAME'
  LEFT JOIN QRY_CHANNEL_GROUP_TRX t3
  ON t1.data->>'CELL_NAME' = t3."CELLNAME"
  AND t1.data->>'BSC_NAME' = t3."NENAME"
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

`
