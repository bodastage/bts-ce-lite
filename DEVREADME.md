# Development notes

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

