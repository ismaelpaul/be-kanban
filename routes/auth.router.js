const express = require('express');
const passport = require('passport');
const { generateToken } = require('../utils/helper');

const authRouter = express.Router();

const CLIENT_URL = process.env.CLIENT_URL;

authRouter.get('/logout', (req, res) => {
	req.logout();
	res.redirect(`${CLIENT_URL}/login`);
});

authRouter
	.route('/google')
	.get(passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter
	.route('/google/callback')
	.get(passport.authenticate('google', { session: false }), (req, res) => {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			// Generate JWT token
			const token = generateToken(req.user.user_id);

			// Set token as a cookie
			res.cookie('token', token, {
				path: '/',
				httpOnly: true,
				expires: new Date(Date.now() + 1000 * 86400), //1 day,
				sameSite: 'none',
				secure: true,
			});

			// Perform redirection
			return res.redirect(`${CLIENT_URL}/boards`);
		} catch (error) {
			console.error(error);
			return res.status(500).send({ error: error.message });
		}
	});

authRouter
	.route('/github')
	.get(passport.authenticate('github', { scope: ['user:email', 'read:user'] }));

authRouter
	.route('/github/callback')
	.get(passport.authenticate('github', { session: false }), (req, res) => {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			// Generate JWT token
			const token = generateToken(req.user.user_id);

			// Set token as a cookie
			res.cookie('token', token, {
				path: '/',
				httpOnly: true,
				expires: new Date(Date.now() + 1000 * 86400), //1 day,
				sameSite: 'none',
				secure: true,
			});

			// Perform redirection
			return res.redirect(`${CLIENT_URL}/boards`);
		} catch (error) {
			console.error('Error in GitHub callback route:', error);
			if (!res.headersSent) {
				return res.status(500).send({ error: error.message });
			}
		}
	});

module.exports = authRouter;
