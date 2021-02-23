const User = require("../models/User");
const bcrypt = require('bcrypt');
const saltRounds = 10;

class UserService {

    constructor(eventService) {
        this.eventService = eventService;
    }

    async createUser(user) {

        const existingUser = await User.findOne({ user: user.user });
        if (existingUser !== null) {
            throw new Error('that user already exists');
        }

        try {
            const encryptedPass = await bcrypt.hash(user.pass, saltRounds);
            user.pass = encryptedPass;
        } catch (error) {
            console.error(error);
            throw new Error('error encrypting pass');
        }

        const u = new User(user);

        const newUser = await u.save();
        this.eventService.createEvent('CREATE', 'USER', newUser._id);

        return newUser;
    }

    async deleteUser(id) {
        //deleteOne from mongodb by id
        const user = await User.findByIdAndDelete(id);
        this.eventService.createEvent('DELETE', 'USER', user._id);
        //return number of items deleted
        return user;
    }

    async getUserById(id) {
        //findOne from mongodb by id
        const user = await User.findById(id);
        //return user
        return user;
    }

    async getUsers(page, amount = 25, name, min = true) {
        //paginate all users, sort by name
        //find and skip page*amount items
        let filter = {};
        if (name) filter.name = new RegExp(name, 'i');

        let projection = min ? { name: 1, title: 1, status: 1 } : {};

        const users = await User.find(filter, projection)
            .sort({ name: 'asc' })
            .skip(page * amount)
            .limit(amount).exec();
        return users;
    }

    async updateUserById(id, doc) {
        const user = await User.findByIdAndUpdate(id, doc, { new: true });

        this.eventService.createEvent('UPDATE', 'USER', user._id);

        return user;
    }
}

module.exports = UserService;