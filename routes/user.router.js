const express = require('express');
const {
	getUsers,
	registerUser,
	checkEmail,
	loginUser,
} = require('../controllers/user.controllers');

const usersRouter = express.Router();

usersRouter.route('/').get(getUsers);
usersRouter.route('/login').post(loginUser);
usersRouter.route('/register').post(registerUser);
usersRouter.route('/check-email').get(checkEmail);

module.exports = usersRouter;
