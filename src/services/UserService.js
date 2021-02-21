const User = require("../models/User");

class UserService {

    constructor(eventService) {
        this.eventService = eventService;
    }

    async createUser(user) {
        //already validated
        //create model
        const u = new User(user);
        //insert into mongodb
        const newUser = await u.save();
        this.eventService.createEvent('CREATE', 'USER', newUser._id);
        //return user with id
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

    async getUsers(page, amount = 25, name) {
        //paginate all users, sort by name
        //find and skip page*amount items
        let filter = {};
        if (name) filter.name = new RegExp(name, 'i');

        const users = await User.find(filter)
            .sort({ name: 'asc' })
            .skip(page * amount)
            .limit(amount).exec();
        return users;
    }
}

module.exports = UserService;