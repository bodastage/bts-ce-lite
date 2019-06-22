const { Pool, Client } = require('pg');
const async = require('async');
		
const pool = new Pool({
  user: null,
  host: '127.0.0.1',
  database: 'boda',
  password: null,
  port: 27017,
})

pool.connect(function (err, client, done) {
	
	var finish = function () {
        done();
        process.exit();
    };
	
	if (err) {
        console.error('could not connect to cockroachdb', err);
        finish();
    }
	
	async.waterfall([
		function (next) {
			client.query('SELECT * FROM huawei_cm.gcell LIMIT 5', next);
		}],
		function (err, results) {
			if (err) {
                console.error('Error inserting into and selecting from accounts: ', err);
                finish();
            }
			

            console.log('Initial balances:');
            results.rows.forEach(function (row) {
                console.log(row);
            });

            finish();
		}
	)
	
})

/*
pool.query('SELECT * FROM huawei_cm.gcell LIMIT 5', (err, res) => {
  console.log(err, res)
  pool.end()
})
*/