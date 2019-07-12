export const NOKIA_2G_KEY_PARAMAETERS = `
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
		t1.data->>'DISTNAME' = SUBSTRING(t2.data->>'DISTNAME', '.*BTS-\d+')
	INNER JOIN nokia_cm."BCF" t3 ON 
		t3.data->>'FILENAME' = t1.data->>'FILENAME' 
		AND CONCAT(TRIM(t3.data->>'DISTNAME'), '/BTS-',TRIM(t1.data->>'segmentId')) = TRIM(t1.data->>'DISTNAME')
	WHERE 
	  TRIM(t2.data->>'preferredBcchMark') = 'The TRX is a preferred TRX (P)'    

`


export const NOKIA_3G_KEY_PARAMAETERS = `
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
		AND TRIM(t2.data->>'DISTNAME') = SUBSTRING(t1.data->>'DISTNAME','.*WBTS-\d+')


`

export const NOKIA_4G_KEY_PARAMAETERS = `
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
