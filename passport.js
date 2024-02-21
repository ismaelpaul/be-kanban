const passport = require('passport');
const jwt = require('jsonwebtoken');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: '/auth/google/callback',
		},
		function (accessToken, refreshToken, profile, cb, done) {
			// TODO: Save user information

			const decodedToken = jwt.decode(profile.id_token, { complete: true });

			done(null, profile);
		}
	)
);

passport.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: '/auth/github/callback',
		},
		async function (accessToken, refreshToken, profile, done) {
			try {
				const emailResponse = await fetch(
					'https://api.github.com/user/emails',
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'User-Agent': 'kanban',
						},
					}
				);
				const emailData = await emailResponse.json();

				// Find the primary email
				const primaryEmail = emailData.find((email) => email.primary);

				if (primaryEmail) {
					// TODO user registration
				} else {
					console.error('No primary email found.');
					done(null, false);
				}
				done(null, profile);
			} catch (error) {
				console.error(error.message);
				done(null, false);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});
