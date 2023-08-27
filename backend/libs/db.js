
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const { sequelize, Sequelize } = require(path.join(__dirname, '..', '..', 'db', 'models', 'index.js'));
console.log("Umzug", Umzug);
console.log(typeof Umzug);
const migrateUp = async () => {
    const umzug = new Umzug({
        migrations: {
          // indicates the folder containing the migration .js files
          glob: path.join(__dirname, '..', '..', 'db', 'migrations', '*.js'),
          // inject sequelize's QueryInterface in the migrations
          params: [
            sequelize.getQueryInterface(),
            Sequelize,
          ],
        },
        context: sequelize.getQueryInterface(),
        // indicates that the migration data should be store in the database
        // itself through sequelize. The default configuration creates a table
        // named `SequelizeMeta`.
        storage: new SequelizeStorage({ sequelize }),
        storageOptions: {
          sequelize,
        },
    });
    
    await umzug.up();
 }


 /**
  * Run a raw query
  * 
  * @param {*} query 
  * @returns 
  */
const runQuery = async (query) => {
  try{
    const [results, metadata] = await sequelize.query(query);
    return results;
  }catch(e){
    console.log(e);
    return false;
  }


  
}

module.exports = {
  runQuery,
  migrateUp
}