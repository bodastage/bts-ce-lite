# Development notes

## Setup
    - install dependencies: `npm install` or yarn install
    - Run web app: yarn run start 
    - Run electron: yarn run electron-dev-unix
    - Running migrations: npx sequelize-cli db:migrate


## Migrations 
```
#create model
npx sequelize-cli model:generate --name eri_cm_cnai_UTRAN_NREL --attributes load_datetime:date,data:string

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

