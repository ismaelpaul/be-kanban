exports.registerUser = async (req, res) => {
	try {
		res.status(200).send({ message: 'Successfully registered' });
	} catch (error) {}
};
