---
id: development
title: Development
sidebar_label: Development Guide
---

Boda-Lite is developed with :
* [Electron](https://electronjs.org) 
* [PostgreSQL](https://postgresql.org)
* [ReactJs](https://reactjs.org/)
* [Nodejs v10+](https://nodejs.org/en/download/)

**Note:** As a graphical user interface(VPS) is a big part of the application, your development environment **must** support launching of a GUI application. 

Before going through the steps to setup the development environment, first go through the contributing guide.

## General setup of development environment
1. Download and install [nodejs](https://nodejs.org/)
2. Clone your fork of Bota-Lite Github code repository
```bash 
git clone https://github.com/GIT_USER_NAME/bts-ce-lite.git
```
3. Go to your cloned repo folder 
4. Install **yarn**
```bash 
npm install --global yarn
```
4. Install dependent packages by running command below
```
yarn install
```
5. Launch development version 
```
yarn run electron:dev
```

## Setup of development enviroment on Windows
1. Download and Install PostgreSQL V10+
2. Download and install Nodejs v10+
3. Install yarn globally
```
npm install --global yarn
```
4. Install windows-build-tools 2017. (*It doesn't work with 2019 for some node modules we are using)  to build native modules for pg, sqlite3, and uws
```
npm install --global windows-build-tools 
```
5. Clone your fork of Bota-Lite Github code repository
```bash 
git clone https://github.com/GIT_USER_NAME/bts-ce-lite.git
```
6. Change working directory to *bts-ce-lite* i.e your cloned git repo
7. Install dependent packages by running command below
```
yarn install
```
8. Launch development version of app
```
yarn run electron:dev
```
9. Close the browser window that is launched
10. Reload the electron UI window that is launched by going to  **View > Force Reload**