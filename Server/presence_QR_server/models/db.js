const mysql = require('mysql2/promise');
const config = require('../config');

async function query(sql, params) {
  const connection = await mysql.createConnection(config.db)

  await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
  await connection.beginTransaction();
  try {
    const [results,] = await connection.execute(sql, params);
    await connection.commit();
    connection.end();
    return results;
  } catch (err) {
    console.error(`Error occurred while creating order: ${err.message}`, err);
    connection.rollback();
    console.info('Rollback successful');
    connection.end();
    return 'error creating order';
  }
}

module.exports = {
  query
}