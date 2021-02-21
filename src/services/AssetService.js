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
        return newAsset;
    }

    async deleteAssetById(id) {
        //deleteOne from mongodb by id
        const asset = await Asset.findByIdAndDelete(id);
        //return deleted asset
        return asset;
    }

    async getAssetById(id) {
        //findOne from mongodb by id
        const asset = await Asset.findById(id);
        //return assets
        return asset;
    }

    async getAssets(page = 0, amount = 25, category, status, name) {
        //paginate all assets, sort by created date
        //if category is not empty, filter category 
        //find and skip page*amount items
        let filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (name) filter.name = new RegExp(name, 'i');

        const assets = await Asset.find(filter)
            .sort({ created: 'desc' })
            .skip(page * amount)
            .limit(amount).exec();
        return assets;
    }
}

module.exports = AssetService;