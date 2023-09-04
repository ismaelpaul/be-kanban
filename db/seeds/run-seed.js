const devData = require('../data/development-data/data.json');
const seed = require('./seed.js');
const db = require('../connection.js');

const runSeed = () => {
	return seed({ data: devData }).then(() => db.end());
};

runSeed();
