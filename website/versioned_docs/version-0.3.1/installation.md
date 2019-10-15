---
id: version-0.3.1-installation
title: Installation
sidebar_label: Installation
original_id: installation
---
- [System Requirements](#system-requirements)
- [Installing Boda-Lite](#installing-laravel)

## System Requirements
The minimum requirements to run Boda-Lite are:
* 64bit operating system 
* Atleast 1GB Memory
* Disk space depends on the data size 
* Windows (8 and later), Linux(3.0.0 kernel and later), or Mac OSX operating system
* Java 8
* PostgreSQL 10

## Installing Boda-Lite
1. Download the installer for the latest version for your OS from the Github releases [page](https://github.com/bodastage/bts-ce-lite/releases). 
2. Run the installer or start the application executable for the portable versions
3. Login with the default username and passsord. The default username and password are **btsuser@bodastage.org** and **password** respectively.
4. Install PostgreSQL 10 from  the  [Enterprise DB Download page](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
5. Setup the database by going to Settings > Databases and clicking *Setup Database*

### Installer names
For installation on windows, select from:
* Boda-Lite-VERSION-win.zip
* Boda-Lite-VERSION-win.exe
* Boda-Lite-Setup-VERSION.exe

For installation on Linux, select from: 
* Boda-Lite-VERSION-x86_64.AppImage
* Boda-Lite-VERSION.x86_64.rpm
* Boda-Lite_VERSION_amd64.deb
* Boda-Lite_VERSION_amd64.snap

For installation on Mac OSX, select from: 
* Boda-Lite-VERSION.dmg

### Installing on linux
To install the **rpm** package run command below.
```
$ rpm -i Boda-Lite-VERSION.x86_64.rpm
```

To install the **.dep** package run command below.
```
$ dpkg -i Boda-Lite_VERSION_amd64.deb
```

To install the **snap** package, run command below. 
```
# Install snap if not already installed 
$ sudo apt update
$ sudo apt install snapd

# Install Boda-Lite span package
$ sudo snap install Boda-Lite_VERSION_amd64.snap
```

## Using PostgreSQL without installation
Below are the steps to follow:
### Running on Windows
1. Create a folder for you postgres download (POSTGRES_FOLDER).
2. Launch **cmd** and go to POSTGRES_FOLDER  <br />
   `cd POSTGRES_FOLDER`
3. Download PostgreSQL using the download script bundled with Boda-Lite  <br />
   `
   C:\Users\<USERNAME>\AppData\Local\Programs\Boda-Lite\resources\db\scripts\download_postgres.bat
   `
4. Initialize PostgreSQL  <br />
`
PostreSQL\pgsql\bin\initdb.exe -D ..\data --username=postgres -auth=trust
`
5. Run PostgreSQL database  <br />
`PostreSQL\pgsql\bin\pg_ctl.exe start -D ../data`


From the above setup, PostgreSQL is running on **localhost** on port **5432** and default user **postgres** with no password.