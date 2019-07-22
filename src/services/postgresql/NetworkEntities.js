export const NETWORK_CELLS = `
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
    t1.data->>'DATETIME' AS "DATETIME",
    'ZTE' as "VENDOR",
	'2G' AS "TECH",
    t1.data->>'GsmCell_id' AS "CELLID",
    t1.data->>'userLabel' AS "CELLNAME"
FROM 
zte_cm."GsmCell" t1
UNION
-- ZTE 3G Cells
SELECT 
    t1.data->>'varDateTime' AS "DATE TIME",
    'ZTE' as "VENDOR",
	'3G' AS "TECH",
    t1.data->>'cid' AS "CELLID",
    t1.data->>'userLabel' AS "CELLNAME"
FROM 
zte_cm."UtranCellFDD" t1
UNION
-- ZTE 4G Cells
SELECT 
    t1.data->>'varDateTime' AS "DATE TIME",
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

export const NETWORK_SITES = `
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
    '4G' AS "TECH",
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
 -- ZTE 2G 
 SELECT 
    'ZTE' as "VENDOR",
    '2G' AS "TECH",
t1.data->>'userLabel' AS "SITENAME"
from zte_cm."BtsSiteManager" t1
UNION 
-- ZTE 3G
SELECT 
    'ZTE' as "VENDOR",
    '3G' AS "TECH",
    t1.data->>'userLabel' AS "SITENAME"
from zte_cm."NodeBFunction" t1
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
`

export const NETWORK_NODES = `
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

`