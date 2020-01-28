const {Pool} = require('pg');
const config = require('../../config.json');

const pool = new Pool(config.postgres);

module.exports = {
    pool: {
        query: pool.query.bind(pool),
        singleRow: async (string, values = []) => {
            const result = await pool.query(string, values);
            return {row: result.rows[0], result: result};
        },
        multiRow: async (string, values = []) => {
            const result = await pool.query(string, values);
            return {row: result.rows, result: result};
        },
    },
    end: () => pool.end()
};
