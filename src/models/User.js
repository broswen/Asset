const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    id: String,
    title: String,
    status: String
})


module.exports = mongoose.model('User', userSchema);