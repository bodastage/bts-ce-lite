exports.shorthands = undefined;

exports.up = (pgm) => {
const NETWORK_RELATIONS = `
--HUAWEI(CFGMML) 3G3G RELATIONS 
select 
	'HUAWEI' as "SRV  VENDOR",
	'3G' as "SRV TECH",
	hex_to_int(REPLACE(t3.data->>'LAC','H''','')) as "SRV LAC",
	t1.data->>'CELLID' as "SRV  CELLID",
	t3.data->>'CELLNAME' as "SRV  CELLNAME",
	'3G' as "NBR TECH",
	hex_to_int(REPLACE(t2.data->>'LAC','H''','')) as "NBR LAC", 
	(t1.data->>'NCELLID')::INTEGER as "NBR CELLID",
	t2.data->>'CELLNAME' as "NBR CELLNAME"
from huawei_cm."UINTRAFREQNCELL" t1
inner join huawei_cm."UCELL" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'NCELLID'= t2.data->>'CELLID' and t1.data->>'NCELLRNCID'=t2.data->>'BSCID'
inner join huawei_cm."UCELL" t3 on t1.data->>'FILENAME'=t3.data->>'FILENAME' and t1.data->>'CELLID'= t3.data->>'CELLID'
union
--HUAWEI(CFGMML) 3G3G EXT RELATIONS
select
'HUAWEI' as "SRV  VENDOR",
'3G' as "SRV TECH",
hex_to_int(REPLACE(t5.data->>'LAC','H''','')) as "SRV LAC",
t3.data->>'CELLID'as "SRV  CELLID",
t5.data->>'CELLNAME' as "SRV  Cell Name",
'3G' as "NBR TECH",
hex_to_int(REPLACE(t4.data->>'LAC','H''','')) as "NBR LAC",
(t3.data->>'NCELLID')::INTEGER as "NBR CELLID" ,
t4.data->>'CELLNAME' as "NBR Cellname"
from huawei_cm."UINTRAFREQNCELL" t3
inner join huawei_cm."UEXT3GCELL" t4 on t3.data->>'FILENAME'=t4.data->>'FILENAME' and t3.data->>'NCELLID' = t4.data->>'CELLID' and t3.data->>'NCELLRNCID'=t4.data->>'NRNCID'
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
INNER JOIN zte_cm."UtranCellFDD" t2 on t1.data->>'FILENAME'=t2.data->>'FILENAME' and t1.data->>'DataType'=t2.data->>'DataType' and t1.data->>'rncid'=t2.data->>'rncid' and t1.data->>'cid'=t2.data->>'cid'
UNION
--Motorola 2G2G Relations
SELECT
'MOTOROLA' AS "SRV VENDOR",
'2G' as "SRV TECH",
(t1.data->>'source_lac')::INTEGER AS "SRV LAC",
t1.data->>'source_ci' AS "SRV CELL ID",
concat(t1.data->>'site_name','_',right(t1.data->>'source_ci',1)) as "SRV CELLNAME",
'2G' as "NBR TECH",
(t1.data->>'dest_lac')::INTEGER AS "NBR LAC",
(t1.data->>'dest_ci')::INTEGER AS "NBR CELL ID",
concat(t2.data->>'site_name','_',right(t2.data->>'ci',1)) as "NBR CELLNAME"
FROM motorola_cm."cell_x_export" t1 
LEFT JOIN motorola_cm."cell_x_export" t2 on t1.data->>'dest_ci'=t2.data->>'ci' and t1.data->>'dest_lac'=t2.data->>'lac' where t1.data->>'dest_bsic' is not null
UNION
--Huawei 2G2G Relations 
SELECT
'HUAWEI' as "SRV VENDOR",
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
'HUAWEI' as "SRV VENDOR",
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
concat(t1.data->>'site_name','_',right(t1.data->>'source_ci',1)) as "SRV CELLNAME",
'3G' as "NBR TECH",
(t1.data->>'dest_lac')::INTEGER AS "NBR LAC",
(t1.data->>'dest_ci')::INTEGER AS "NBR CELL ID",
null as "NBR CELLNAME"
FROM motorola_cm."cell_x_export" t1 where t1.data->>'dest_rnc_id' is not null
UNION
---3G-3G Relations (Nokia RAML)
SELECT 
'NOKIA' AS "SRV VENDOR",
'3G' AS "SRV TECH",
(t2.data->>'LAC')::INTEGER AS "SRV LAC",
t2.data->>'CId' AS "SRV CI",
t2.data->>'name' AS "SRV CELL NAME",
'3G' AS "NBR TECH",
(t1.data->>'AdjsLAC')::INTEGER AS "NBR LAC",
(t1.data->>'AdjsCI')::INTEGER AS "NBR CI",
t1.data->>'name' AS "NBR CELL NAME"
FROM nokia_cm."ADJS" t1
INNER JOIN nokia_cm."WCEL" t2 ON t1.data->>'FILENAME'=t2.data->>'FILENAME'
    AND t2.data->>'DISTNAME' = SUBSTRING(t1.data->>'DISTNAME', '.*WCEL-\\d+')
UNION	
---3G-2G Relations (Nokia RAML)
SELECT 
'NOKIA' AS "SRV VENDOR",
'3G' AS "SRV TECH",
(t2.data->>'LAC')::INTEGER AS "SRV LAC",
t2.data->>'CId' AS "SRV CI",
t2.data->>'name' AS "SRV CELL NAME",
'2G' AS "NBR TECH",
(t1.data->>'AdjgLAC')::INTEGER AS "NBR LAC",
(t1.data->>'AdjgCI')::INTEGER AS "NBR CI",
t1.data->>'name' AS "NBR CELL NAME"
FROM nokia_cm."ADJG" t1
INNER JOIN nokia_cm."WCEL" t2 ON t1.data->>'FILENAME'=t2.data->>'FILENAME'
    AND t2.data->>'DISTNAME' = SUBSTRING(t1.data->>'DISTNAME', '.*WCEL-\\d+')
UNION	
---2G-3G Relations (Nokia RAML)
SELECT 
'NOKIA' AS "SRV VENDOR",
'2G' AS "SRV TECH",
(t2.data->>'locationAreaIdLAC')::INTEGER AS "SRV LAC",
t2.data->>'cellId' AS "SRV CI",
t2.data->>'name' AS "SRV CELL NAME",
'3G' AS "NBR TECH",
(t1.data->>'lac')::INTEGER AS "NBR LAC",
(t1.data->>'AdjwCId')::INTEGER AS "NBR CI",
t1.data->>'name' AS "NBR CELL NAME"
FROM nokia_cm."ADJW" t1
INNER JOIN nokia_cm."BTS" t2 ON t1.data->>'FILENAME'=t2.data->>'FILENAME'
    AND t2.data->>'DISTNAME' = SUBSTRING(t1.data->>'DISTNAME', '.*BTS-\\d+')
UNION
---2G-2G Relations (Nokia RAML)
SELECT 
'NOKIA' AS "SRV VENDOR",
'2G' AS "SRV TECH",
(t2.data->>'locationAreaIdLAC')::INTEGER AS "SRV LAC",
t2.data->>'cellId' AS "SRV CI",
t2.data->>'name' AS "SRV CELL NAME",
'2G' AS "NBR TECH",
(t1.data->>'adjacentCellIdLac')::INTEGER AS "NBR LAC",
(t1.data->>'adjacentCellIdCI')::INTEGER AS "NBR CI",
t1.data->>'name' AS "NBR CELL NAME"
FROM nokia_cm."ADCE" t1
INNER JOIN nokia_cm."BTS" t2 ON t1.data->>'FILENAME'=t2.data->>'FILENAME'
    AND t2.data->>'DISTNAME' = SUBSTRING(t1.data->>'DISTNAME', '.*BTS-\\d+')
`;


	pgm.sql(`
UPDATE 
	reports.reports 
	SET 
	query = $$${NETWORK_RELATIONS}$$ 
FROM 
( SELECT id as report_id FROM reports.reports WHERE name = 'Network Relations' ) AS  subqry
WHERE reports.reports.id = subqry.report_id 
	`);
	
};



exports.down = (pgm) => {

};
