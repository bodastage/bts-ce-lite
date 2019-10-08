---
id: version-2.3.0-development
title: Development
sidebar_label: Development Guide
original_id: development
---

Boda-Lite is developed with :
* [Electron](https://electronjs.org) 
* [PostgreSQL](https://postgresql.org)
* [ReactJs](https://reactjs.org/)

## Setting up development environment
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