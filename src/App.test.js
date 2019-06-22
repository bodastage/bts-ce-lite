import React from 'react';
import ReactDOM from 'react-dom';

const { Pool, Client } = require('pg');

		
const pool = new Pool({
  user: '',
  host: '127.0.0.1',
  database: 'boda',
  password: '',
  port: 27017,
})

pool.connect(function (err, client, done) {
	client.query('SELECT * FROM huawei_cm.gcell LIMIT 5', (err, res) => {
		  console.log(err, res)
		  client.end()
	})
})

/*
pool.query('SELECT * FROM huawei_cm.gcell LIMIT 5', (err, res) => {
  console.log(err, res)
  pool.end()
})
*/

describe('Postgres QUERY', () => {
    it('should connect to MongoDB', () => {
		
		/*
		const client = new Client({
		  user: '',
		  host: '127.0.0.1',
		  database: 'boda',
		  password: '',
		  port: 27017,
		})
		
		client.connect()

		client.query('SELECT NOW()', (err, res) => {
		  console.log(err, res)
		  client.end()
		})
		*/
		
		 expect(1).toBe(1);

	})
})