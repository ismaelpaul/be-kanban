const express = require('express');
const {
	registerUser,
	checkEmail,
	loginUser,
	getUserById,
	getUser,
	logoutUser,
} = require('../controllers/user.controllers');
const { isAuthenticated } = require('../middleware/auth.middleware');

const usersRouter = express.Router();

usersRouter.route('/').get(isAuthenticated, getUser);
usersRouter.route('/:user_id').get(getUserById);
usersRouter.route('/login').post(loginUser);
usersRouter.route('/logout').post(logoutUser);
usersRouter.route('/register').post(registerUser);
usersRouter.route('/check-email').get(checkEmail);

module.exports = usersRouter;
