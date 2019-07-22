export const ZTE_2G_KEY_PARAMAETERS = `
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

`

export const ZTE_3G_KEY_PARAMAETERS = `
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

`

export const ZTE_4G_KEY_PARAMAETERS = `
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
`
