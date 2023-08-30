# Development notes

## Windows setup 
* install windows build tools -- 2017+ preferred
* install paython 3+ 
* install nodejs 16+
* clone the repo
* con

## Setup
    - install dependencies: `npm install` or yarn install
    - Run web app: yarn run start 
    - Run electron: yarn run electron-dev-unix
    - Running migrations: npx sequelize-cli db:migrate


## Migrations 
```
#create model
npx sequelize-cli model:generate --name reports_categories --attributes name:string,parent_id:integer,notes:text,in_built:boolean,created_by:integer,updated_by:integer,created_at:date,updated_at:date

npx sequelize-cli model:generate --name reports --attributes name:string,parent_id:integer,notes:text,query:text,options:text,type:string,category_id:integer,in_built:boolean,created_by:integer,updated_by:integer,created_at:date,updated_at:date


#running migrations
npx sequelize-cli db:migrate

#undo migrations
npx sequelize-cli db:migrate:undo

#creating seed data
npx sequelize-cli seed:generate --name demo-user

#running seed data
npx sequelize-cli db:seed:all

#undoing seeders
npx sequelize-cli db:seed:undo


```

##  Native modules 

### Verify required tools are installed on linux or mac
```
node --version
npm --version
python --version
git --version
cc --version
make --version
```

## Add externals folder to vscode include path 

* go to the extension settings 
* locate the C/C++: Include Path setting
* Click "Add item" and insert the path to the externals folder.
* alternatively, search for @ext:ms-vscode.cpptools includePath in the settings search box and add the path to the externals folder.


## Installing libxml2 on macos

```
brew install automake autoconf libtool libxml2 pkg-config
brew link libxml2; fi


#extracting asar files
npx asar extract app.asar wwww   

const dbPath = path.join(app.getPath("userData"), "sample.db")

```





## Resources 

* https://nodejs.github.io/node-addon-examples/about/what
* https://github.com/atiqg/Nodejs-Napi-Addon-Using-Cmake
* https://architecturenotes.co/datasette-simon-willison/
* https://til.simonwillison.net/electron/python-inside-electron