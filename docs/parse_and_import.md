# Parse and Import

The **Parse and Import** module parses network dumps and optionally loads them into the database.  Below is a 
screenshot of the module.

![Parse and Import](./images/parse_and_import.png)

The **Data type** field has three options: CM, FM, and PM. CM for configuration management files, PM for performance management files, and FM for fault management network dumps. 

The **Load into database** switch determines whether to only stop on parsing. or to load the data into the database after parsing. The **Clear tables before loading** truncatebls
the database table before loading new data. Otherwise new data is added to the table without deleting the previous one.

The formats below are supported as of version 0.3.0.

| Data type        | Vendor           | Format  | Notes  |
| ------------- |:-------------:| -----:|-----:|
| CM      | ERICSSON | BULKCM | Bulk CM XML  |
| CM      | ERICSSON      |   CNAIV2 |   |
| CM | ERICSSON      |    BSM |   |
| CM      | HUAWEI | GEXPORT_XML |   |
| CM      | HUAWEI      |   NBI_XML |   |
| CM | HUAWEI      |    CFGMML |   |
| CM | HUAWEI      |    AUTOBAK_XML |   |
| CM | ZTE      |    BULKCM |   |
| CM | ZTE      |    XLS | Excel Plan Template Data Workbook  |
| CM | NOKIA      |    RAML | RAML XML  |
| CM | MOTOROLA      |    CELL_X_EXPORT | Cell X Export dump  |

