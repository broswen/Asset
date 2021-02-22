const mongoose = require('mongoose');

const credSchema = new mongoose.Schema({
    user: String,
    hash: String,
    claims: [String]
})


module.exports = mongoose.model('Creds', credSchema);