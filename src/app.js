const express = require('express');
const mongoose = require('mongoose');
const { body, query, validationResult } = require('express-validator');


const { port, mongoURL, dbName } = require('./config/configuration');
const AssetService = require('./services/AssetService');
const UserService = require('./services/UserService');
const EventService = require('./services/EventService');

const app = express();

app.use(express.json());

mongoose.connect(mongoURL + '/' + dbName, { useNewUrlParser: true, useUnifiedTopology: true });
this.db = mongoose.connection;

const eventService = new EventService();
const assetService = new AssetService(eventService);
const userService = new UserService(eventService);

app.post('/asset',
    body('name').isString().isLength({ min: 1, max: 256 }),
    body('description').isString().isLength({ min: 0, max: 256 }),
    body('category').isString().isLength({ min: 1, max: 256 }),
    body('tags').isArray().optional(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (req.body.tags === undefined) req.body.tags = [];

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
    query('min').isBoolean().optional(),
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
        const min = req.query.min === 'true';

        const assets = await assetService.getAssets(page, amount, category, status, name, min);

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

app.put('/asset/:id',
    body('name').isString().isLength({ min: 1, max: 256 }).optional(),
    body('description').isString().isLength({ min: 1, max: 256 }).optional(),
    body('category').isString().isLength({ min: 1, max: 256 }).optional(),
    body('status').isString().isLength({ min: 1, max: 256 }).optional(),
    body('user').isString().isLength({ min: 1, max: 256 }).optional(),
    async (req, res) => {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send('invalid id');
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const asset = await assetService.updateAssetById(id, req.body);
        res.send(asset);
    }
);

app.delete('/asset/:id', async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('invalid id');
    }
    const asset = await assetService.deleteAssetById(id);
    res.send(asset);
});

//user routes

app.post('/user',
    body('name').isString().isLength({ min: 1, max: 256 }),
    body('title').isString().isLength({ min: 1, max: 256 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        req.body.created = new Date();
        req.body.status = 'ACTIVE';

        const user = await userService.createUser(req.body);

        res.send(user);
    }
);

app.put('/user/:id',
    body('name').isString().isLength({ min: 1, max: 256 }).optional(),
    body('title').isString().isLength({ min: 1, max: 256 }).optional(),
    body('status').isString().isLength({ min: 1, max: 256 }).optional(),
    async (req, res) => {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send('invalid id');
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await userService.updateUserById(id, req.body);
        res.send(user);
    }
);

app.get('/user',
    query('page').isInt().optional(),
    query('amount').isInt().optional(),
    query('name').isString().optional(),
    query('min').isBoolean().optional(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const page = parseInt(req.query.page);
        const amount = parseInt(req.query.amount);
        const name = req.query.name;
        const min = req.query.min === 'true';

        const users = await userService.getUsers(page, amount, name, min);

        res.send(users);
    }
);

app.get('/user/:id', async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('invalid id');
    }
    const user = await userService.getUserById(id);
    res.send(user);
});

app.delete('/user/:id', async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('invalid id');
    }
    const asset = await userService.deleteUser(id);
    res.send(asset);
});

//event routes

app.get('/event',
    query('page').isInt().optional(),
    query('amount').isInt().optional(),
    query('eType').isString().optional(),
    query('oType').isString().optional(),
    query('sDate').isISO8601().toDate().optional(),
    query('eDate').isISO8601().toDate().optional(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const page = parseInt(req.query.page);
        const amount = parseInt(req.query.amount);
        const eventType = req.query.eType;
        const objectType = req.query.oType;
        const startDate = req.query.sDate;
        const endDate = req.query.eDate;

        const users = await eventService.getEvents(page, amount, eventType, objectType, startDate, endDate);

        res.send(users);
    }
);

app.listen(port, () => {
    console.log(`listening on ${port}`);
})
