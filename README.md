[![Build Status](https://travis-ci.org/bodastage/bts-ce-lite.svg?branch=master)](https://travis-ci.org/bodastage/bts-ce-lite) ![GitHub release](https://img.shields.io/github/release/bodastage/bts-ce-lite.svg)  ![GitHub All Releases](https://img.shields.io/github/downloads/bodastage/bts-ce-lite/total.svg) [![GitHub license](https://img.shields.io/github/license/bodastage/bts-ce-lite.svg)](https://github.com/bodastage/bts-ce-lite/blob/master/LICENSE) [![GitHub issues](https://img.shields.io/github/issues/bodastage/bts-ce-lite.svg)](https://github.com/bodastage/bts-ce-lite/issues)

# Boda-Lite

Boda-Lite is a minimal feature version of [bts-ce](https://github.com/bodastage/bts-ce). It is a cross 
platform telecommunication management desktop app.

## Features
* Parsing and loading telecommunication configuration management(CM) dumps for various vendors(Ericsson, Huawei, Nokia, ZTE)
* Parsing and loading telecommunication performance management(PM) network dumps
* Reports module that supports tabular, graphs, and composite(dashboard-like) reports
* Advanced GIS module
* Network baseline audit
* Utilities: CSV to Excel, KML Generator

## Built with 
* [Electron](https://electronjs.org)
* [PostgreSQL](https://www.postgresql.org/)
* [ReactJs](https://reactjs.org/)
* [SQLite3](https://www.sqlite.org/index.html)

## Screenshots 
![BTS-CE-Lite Dashboard and Reports](/dashboard_and_reports.png?raw=true "Dashboard and Reports")

![BTS-CE-Lite GIS](/gis.jpeg?raw=true "GIS")



## Running dev mode
``` bash
export SKIP_PREFLIGHT_CHECK=true
yarn run start 

#
yarn run electron-dev-unix
```

## Getting help
To report issues with the application or request new features use the issue tracker. For help and customizations send an email to info@bodastage.com.

## License

[Apache 2.0](LICENSE.md)


