const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user: String,
    name: String,
    title: String,
    status: String,
    pass: String,
    perms: [String]
})


module.exports = mongoose.model('User', userSchema);