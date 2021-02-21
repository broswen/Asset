const express = require('express');
const mongoose = require('mongoose');
const { body, query, validationResult } = require('express-validator');


const { port, mongoURL } = require('./config/configuration');
const AssetService = require('./services/AssetService');
const UserService = require('./services/UserService');

const app = express();

app.use(express.json());

mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
this.db = mongoose.connection;

//TODO inject event service
const assetService = new AssetService(null);
const userService = new UserService(null);

app.post('/asset',
    body('name').isString().isLength({ min: 1, max: 256 }),
    body('description').isString().isLength({ min: 0, max: 256 }),
    body('category').isString().isLength({ min: 1, max: 256 }),
    body('tags').isArray(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        req.body.created = new Date();
        req.body.status = 'IN';
        req.body.user = null;
        req.body.barcode = null;
        req.body.bundle = null;

        const asset = await assetService.createAsset(req.body);

        res.send(asset);
    }
);

app.get('/asset',
    query('page').isInt().optional(),
    query('amount').isInt().optional(),
    query('c').isAlphanumeric().optional(),
    query('s').isAlphanumeric().optional(),
    query('name').isString().optional(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const page = parseInt(req.query.page);
        const amount = parseInt(req.query.amount);
        const category = req.query.c;
        const status = req.query.s;
        const name = req.query.name;

        const assets = await assetService.getAssets(page, amount, category, status, name);

        res.send(assets);
    }
);

app.get('/asset/:id', async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('invalid id');
    }
    const asset = await assetService.getAssetById(id);
    res.send(asset);
});

app.delete('/asset/:id', async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('invalid id');
    }
    const asset = await assetService.deleteAssetById(id);
    res.send(asset);
});


app.listen(port, () => {
    console.log(`listening on ${port}`);
})
