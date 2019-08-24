# Parse and Import

The **Parse and Import** module parses network dumps and optionally loads them into the database.  Below is a 
screenshot of the module.

![Parse and Import](./images/parse_and_import.png)

The **Data type** field has three options: CM, FM, and PM. CM for configuration management files, PM for performance management files, and FM for fault management network dumps. 

The **Load into database** switch determines whether to only stop on parsing. or to load the data into the database after parsing. The **Clear tables before loading** truncatebls
the database table before loading new data. Otherwise new data is added to the table without deleting the previous one.

## Vendor File Formats
The formats below are supported as of version 0.3.0.

| Data type        | Vendor           | Format  | Notes  |
| ------------- |-------------| -----|-----|
| CM      | ERICSSON | BULKCM | Bulk CM XML  |
| CM      | ERICSSON      |   CNAIV2 |   |
| CM | ERICSSON      |    BSM |   |
| CM | ERICSSON      |    EAW |   |
| CM      | HUAWEI | GEXPORT_XML |   |
| CM      | HUAWEI      |   NBI_XML |   |
| CM | HUAWEI      |    CFGMML |   |
| CM | HUAWEI      |    AUTOBAK_XML |   |
| CM | ZTE      |    BULKCM |   |
| CM | ZTE      |    XLS | Excel Plan Template Data Workbook  |
| CM | NOKIA      |    RAML | RAML XML  |
| CM | MOTOROLA      |    CELL_X_EXPORT | Cell X Export dump  |
| CM | BODSTAGE      |    BCF_CSV | Boda Cell File in csv format  |
| PM | ERICSSON      |    MEAS_COLLEC_XML |  3GPP TS 32.432(SA5) Performance Management Files |
| PM | HUAWEI      |    NE_BASED_MEAS_COLLEC_XML |  NE Based Performance Management Files |
| PM | ZTE      |    MEAS_COLLEC_XML |  3GPP TS 32.432(SA5) Performance Management Files |
| PM | NOKIA      |    PM_XML |   |

## Boda Cell File (BCF)
 Boda Cell File is a text file used to import network data into boda-lite. This data is loaded into the tools
 plan environment. The data source could be a planning tool or any other external source. 
 The boda cell file can load 2G, 3G, and 4G cell parameters. 
 
### How to import
 To import the Boda cell file data into Boda-lite 
1. Go to the **Parse and Import** module
2. Select **CM** from the **Data type** select field 
3. Select **BODASTAGE/BCF_CSV** from the **Vendor/Format** select field
4. Select the input folder with the location of the cell files
5. Process
 
 ### 2G Cell Parameters


| Parameters | Comments  |
| --- | --- |
| technology | Required. Values: **GSM**  |
| ci | Required  |
| cellname | Required  |
| siteid | Required  |
| carrier_layer |   |
| azimuth |   |
| electrical_tilt |   |
| mechanical_tilt |   |
| lac |   |
| node |   |
| bcch | Required  |
| trx_frequencies |   |
| antenna_beam |   |
| latitude | Required  |
| longitude | Required  |
| height |   |
| vendor |   |
| cell_type |   |
| bsic | Required  |
| bcc |   |
| ncc |   |
| mnc |   |
| mcc |   |
| cgi |   |
| nbr_1 | Values are neighbour cell CIs  |
| nbr_n |   |

### 3G Cell Parameters

| Parameter | Comments |
| --- | --- |
| technology | Values: **UMTS**  |
| ci | Required  |
| cellname | Required  |
| siteid | Required  |
| carrier_layer |   |
| azimuth | Required  |
| electrical_tilt |   |
| mechanical_tilt |   |
| lac |   |
| rac |   |
| sac |   |
| node |   |
| psc | Required  |
| uarfcn | Required  |
| antenna_beam |   |
| latitude | Required  |
| longitude | Required  |
| height |   |
| vendor |   |
| cell_type |   |
| mnc |   |
| mcc |   |
| cgi |   |
| rncid |   |
| nbr_1 | Values are neighbour cell CIs  |
| nbr_n |   |

### 4G Cell Parameters

| technology | Comments  |
| --- | --- |
| technology | Value options are **LTE**  |
| ci | Required  |
| cellname | Required  |
| siteid | Required  |
| enodeb_id |   |
| carrier_layer |   |
| azimuth |   |
| electrical_tilt |   |
| mechanical_tilt |   |
| tac |   |
| node |   |
| pci | Required  |
| euarfcn | Required  |
| bandwidth |   |
| ecgi |   |
| mnc |   |
| mcc |   |
| antenna_beam |   |
| latitude | Required  |
| longitude | Required  |
| height |   |
| vendor |   |
| cell_type |   |
| nbr_1 | Values are neighbour cell CIs  |
| nbr_n |   |