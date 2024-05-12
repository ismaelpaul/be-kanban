const express = require('express');
const { getUsers, registerUser } = require('../controllers/user.controllers');

const usersRouter = express.Router();

usersRouter.route('/').get(getUsers);
usersRouter.route('/register').post(registerUser);

module.exports = usersRouter;
