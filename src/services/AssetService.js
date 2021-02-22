const Asset = require('../models/Asset');
const mongoose = require('mongoose');

class AssetService {

    constructor(eventService) {
        this.eventService = eventService;
    }

    async createAsset(asset) {
        //already validated by route middleware
        //create model
        const a = new Asset(asset);
        //insert into mongodb
        const newAsset = await a.save();
        //return asset with id
        this.eventService.createEvent('CREATE', 'ASSET', newAsset._id);
        return newAsset;
    }

    async deleteAssetById(id) {
        //deleteOne from mongodb by id
        const asset = await Asset.findByIdAndDelete(id);
        //return deleted asset
        this.eventService.createEvent('DELETE', 'ASSET', asset._id);
        return asset;
    }

    async getAssetById(id) {
        //findOne from mongodb by id
        const asset = await Asset.findById(id);
        //return assets
        return asset;
    }

    async getAssets(page = 0, amount = 25, category, status, name, min = true) {
        //paginate all assets, sort by created date
        //if category is not empty, filter category 
        //find and skip page*amount items
        let filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (name) filter.name = new RegExp(name, 'i');

        let projection = min ? { name: 1, category: 1, status: 1, created: 1 } : {};

        const assets = await Asset.find(filter, projection)
            .sort({ created: 'desc' })
            .skip(page * amount)
            .limit(amount).exec();
        return assets;
    }

    async updateAssetById(id, doc) {
        const asset = await Asset.findByIdAndUpdate(id, doc, { new: true });

        this.eventService.createEvent('UPDATE', 'ASSET', asset._id);

        return asset;
    }
}

module.exports = AssetService;