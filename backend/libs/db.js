export const migrateUp = async () => {
    const umzug = new Umzug({
        migrations: {
          // indicates the folder containing the migration .js files
          path: path.join(basepath, 'src', 'db', 'migrations'),
          // inject sequelize's QueryInterface in the migrations
          params: [
            sequelize.getQueryInterface(),
            Sequelize,
          ],
        },
        // indicates that the migration data should be store in the database
        // itself through sequelize. The default configuration creates a table
        // named `SequelizeMeta`.
        storage: 'sequelize',
        storageOptions: {
          sequelize,
        },
    });
    
     await umzug.up();
 }