const mysql = require('mysql2');
const config = require('../../config.json');

const pool = mysql.createPool(config.mysql);

module.exports = {
    create: () => pool.promise(),
    end: () => pool.end()
};
