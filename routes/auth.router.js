const express = require('express');
const passport = require('passport');
const { registerUser } = require('../controllers/auth.controller');

const authRouter = express.Router();

const CLIENT_URL = process.env.CLIENT_URL;

authRouter.get('/logout', (req, res) => {
	req.logout();
	res.redirect(`${CLIENT_URL}/login`);
});

authRouter
	.route('/google')
	.get(passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.route('/google/callback').get(
	passport.authenticate('google', {
		successRedirect: `${CLIENT_URL}/boards`,
		failureRedirect: `${CLIENT_URL}/login`,
	})
);

authRouter
	.route('/github')
	.get(passport.authenticate('github', { scope: ['user:email', 'read:user'] }));

authRouter.route('/github/callback').get(
	passport.authenticate('github', {
		successRedirect: CLIENT_URL,
		failureRedirect: '/login/failed',
	})
);

authRouter.route('/login').post(passport.authenticate('local'), (req, res) => {
	const user = req.user;
	res.status(200).send(user);
});

authRouter.route('/register').post(registerUser);

authRouter.route('/logout').post();

module.exports = authRouter;
