const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: String,
    id: String,
    category: String,
    tags: Array,
    description: String,
    bundle: String,
    status: String,
    user: String,
    created: Date,
    barcode: Number
})


module.exports = mongoose.model('Asset', assetSchema);