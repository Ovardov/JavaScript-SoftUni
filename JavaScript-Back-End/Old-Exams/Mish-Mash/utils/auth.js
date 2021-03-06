const jwt = require('./jwt');
const handleError = require('./handleError')
const { authCookieName } = require('../appConfig');
const { userModel } = require('../models/index');

function auth(isAuth = true) {
    return async function (req, res, next) {
        const token = req.cookies[authCookieName] || '';

        try {
            const data = await jwt.verifyToken(token);
            const user = await userModel.findById(data.id);

            // If have roles
            if(user) {
                if (user.role.includes('Admin')) {
                    user.isAdmin = true;
                } else if (user.role.includes('User')) {
                    user.isUser = true;
                }
            }

            req.user = user;
            next();
        } catch (e) {
            if (!isAuth) {
                next();
                return;
            }

            if (e.message === 'jwt must be provided' || e.message === 'token expired') {
                handleError(res, 'authentication', e.message);
                res.render('guest/login');
                return;
            }

            next(e);
        }
    }
}

module.exports = auth;