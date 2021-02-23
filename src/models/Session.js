const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user: String,
    perms: [String]
})


module.exports = mongoose.model('Session', sessionSchema);