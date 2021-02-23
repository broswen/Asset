const Session = require("../models/Session");
const User = require("../models/User");
const bcrypt = require('bcrypt');
const saltRounds = 10;
class AuthService {

    constructor() { }

    async login(user, pass) {
        const userInfo = await User.findOne({ user: user });
        if (userInfo === null) {
            throw new Error('user not found');
        }

        if (!bcrypt.compare(pass, userInfo.pass)) {
            throw new Error('password hash does not match')
        }
        const session = new Session({ user: userInfo.user, perms: userInfo.perms });
        await session.save();
        return session;
    }

    async getSession(id) {
        const session = await Session.findById(id);

        return session;
    }

}

module.exports = AuthService;