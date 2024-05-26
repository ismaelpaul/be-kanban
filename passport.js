const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
	checkUserExistsByEmail,
	checkUserExistsById,
	insertGoogleOrGithubUser,
} = require('./models/auth.models');
const { comparePassword } = require('./utils/helper');
const { insertBoard } = require('./models/boards.models');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: '/auth/google/callback',
		},
		async function (accessToken, refreshToken, profile, done) {
			try {
				const payload = profile._json;

				const existingUser = await checkUserExistsByEmail(payload.email);

				if (existingUser.userExists) {
					done(null, existingUser.user);
				} else {
					const user = {
						first_name: payload.given_name,
						last_name: payload.family_name,
						email: payload.email,
						avatar: payload.picture,
					};

					const newUser = await insertGoogleOrGithubUser(user);

					const name = 'New Board';
					await insertBoard(newUser.user_id, name);

					done(null, newUser);
				}
			} catch (error) {
				console.error(error.message);
				done(null, false);
			}
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
					const existingUser = await checkUserExistsByEmail(primaryEmail.email);

					if (existingUser.userExists) {
						done(null, existingUser.user);
					} else {
						const nameArray = profile.displayName.split(' ');
						const firstName = nameArray[0];
						const lastName = nameArray[nameArray.length - 1];

						const user = {
							first_name: firstName,
							last_name: lastName,
							email: primaryEmail.email,
							avatar: profile.photos[0].value,
						};

						const newUser = await insertGoogleOrGithubUser(user);

						done(null, newUser);
					}
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

passport.use(
	new LocalStrategy({ usernameField: 'email' }, async function (
		email,
		password,
		done
	) {
		if (!email || !password) {
			throw new Error('Missing credentials');
		}

		const userExists = await checkUserExistsByEmail(email);

		if (!userExists) {
			throw new Error('User not found');
		}

		const userDB = userExists.user;

		const userPassword = userExists.user.password;

		const isValid = comparePassword(password, userPassword);

		if (isValid) {
			return done(null, userDB);
		} else {
			return done(null, false, {
				message: 'Unauthorized, please login!',
			});
		}
	})
);

passport.serializeUser((user, done) => {
	done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await checkUserExistsById(id);
		if (!user) throw new Error('User not found');
		done(null, user.user);
	} catch (error) {
		console.log(error);
	}
});
