const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: String,
    category: String,
    tags: [String],
    description: String,
    bundle: String,
    status: String,
    user: String,
    created: Date,
    barcode: Number
})


module.exports = mongoose.model('Asset', assetSchema);