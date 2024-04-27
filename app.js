const express = require('express');
const apiRouter = require('./routes/api.router');
const cookieSession = require('cookie-session');
const passport = require('passport');
const cors = require('cors');
const authRouter = require('./routes/auth.router');
require('./passport');

const app = express();

app.use(express.json());

app.use(
	cookieSession({
		name: 'session',
		keys: [process.env.COOKIE_KEY],
		maxAge: 24 * 60 * 60 * 1000,
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
	cors({
		origin: ['http://localhost:5173', 'https://fe-kanban.netlify.app'],
		headers: ['Content-Type'],
		credentials: true,
	})
);

app.use('/api', apiRouter);

app.use('/auth', authRouter);

//error handling
app.use('/*', (req, res) => {
	res.status(404).send({ msg: 'Page not found.' });
});

app.use((err, req, res, next) => {
	console.error('Error in production:', err);
	if (err.code === '22P02') {
		res.status(400).send({ msg: 'Invalid ID.' });
	} else if (err.status && err.msg) {
		res.status(err.status).send({ msg: err.msg });
	} else {
		res.status(500).send({ msg: 'Internal Server Error!' });
	}
});

module.exports = app;
