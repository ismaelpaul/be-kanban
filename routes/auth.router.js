const express = require('express');
const passport = require('passport');

const authRouter = express.Router();

const CLIENT_URL = process.env.CLIENT_URL;

authRouter.get('/login/success', (req, res) => {
	if (req.user) {
		res.status(200).json({
			success: true,
			message: 'successfull',
			user: req.user,
			cookies: req.cookies,
		});
	}
});

authRouter.get('/login/failed', (req, res) => {
	res.status(401).json({
		success: false,
		message: 'failure',
	});
});

authRouter.get('/logout', (req, res) => {
	req.logout();
	res.redirect(CLIENT_URL);
});

authRouter
	.route('/google')
	.get(passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.route('/google/callback').get(
	passport.authenticate('google', {
		successRedirect: CLIENT_URL,
		failureRedirect: '/login/failed',
	})
);

module.exports = authRouter;
