const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    date: Date,
    // CREATE, UPDATE, DELETE
    eventType: String,
    // ASSET, USER, BUNDLE
    objectType: String,
    // mongodb id
    objectId: String,
})


module.exports = mongoose.model('Event', eventSchema);