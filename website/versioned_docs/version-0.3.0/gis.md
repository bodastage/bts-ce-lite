---
id: version-0.3.0-gis
title: GIS
sidebar_label: GIS
original_id: gis
---

This GIS module displays cells and sites and their properties on a map. It allows filtering based on technology, name, and environment. 

Below is a screenshot of the GIS module. 

![GIS Module](/bts-ce-lite/img/gis.jpeg)

## Importing data
Currently, we can import boda cell files(structure is avialable in the import and load documentation) and TEMS CEL and XML files for GSM, WCDMA, and LTE. To import data, 
launch the GIS module, click the **data icon** on the left menu to see import options. Select the import file format and optionaly 
specify whether to first clear the old data before loading the new data.
shows how to
![Import data into Map](/bts-ce-lite/img/gis_import_data.png)

## Filtering cells 
It's important to filter the cells on the map so that you can concentrate on the key cells you want to view. 
Filtering can be donw by selecting the technology, or searching for a cell's name vie the filter search text field. The search 
text fields accepts regular expressions for complex filtering criteria.

![Filtering cells on the map](/bts-ce-lite/img/gis_filter_cells.png)

## Editing display properties
The property edit pane allows your to set the sector radius per technology and specify the 
color used for each carrier frequency.

![Update sector colors](/bts-ce-lite/img/gis_update_carrier_colors.png)