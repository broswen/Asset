const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { body, query, validationResult } = require('express-validator');


const { port, mongoURL, dbName } = require('./config/configuration');
const AssetService = require('./services/AssetService');
const UserService = require('./services/UserService');
const EventService = require('./services/EventService');
const AuthService = require('./services/AuthService');

const loggerMiddleware = async (req, res, next) => {
    const info = {
        method: req.method,
        path: req.path,
        cookies: req.cookies,
        ip: req.ip,
        date: new Date().toISOString()
    };
    console.log(info);
    next();
};

const authMiddleware = (perms = []) => (async (req, res, next) => {
    if (!req.cookies.sessionId) {
        return res.sendStatus(401);
    }
    const session = await authService.getSession(req.cookies.sessionId);
    if (session === null) {
        return res.sendStatus(401);
    }

    req.session = session;

    if (perms.length > 0) {
        let flag = false;
        for (let p of perms) {
            if (session.perms.includes(p)) {
                flag = true;
                break;
            }
        }
        if (!flag) return res.sendStatus(403);
    }
    next();
});

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

mongoose.connect(mongoURL + '/' + dbName, { useNewUrlParser: true, useUnifiedTopology: true });
this.db = mongoose.connection;

const eventService = new EventService();
const assetService = new AssetService(eventService);
const userService = new UserService(eventService);
const authService = new AuthService();

app.post('/asset',
    body('name').isString().isLength({ min: 1, max: 256 }),
    body('description').isString().isLength({ min: 0, max: 256 }),
    body('category').isString().isLength({ min: 1, max: 256 }),
    body('tags').isArray().optional(),
    authMiddleware(['admin']),
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
    authMiddleware(['admin']),
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

app.delete('/asset/:id',
    authMiddleware(['admin']),
    async (req, res) => {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send('invalid id');
        }

        const asset = await assetService.deleteAssetById(id);
        res.send(asset);
    }
);

//user routes

app.post('/user',
    body('user').isString().isLength({ min: 2, max: 50 }),
    body('name').isString().isLength({ min: 2, max: 50 }),
    body('pass').isString().isLength({ min: 6, max: 50 }),
    body('title').isString().isLength({ min: 1, max: 256 }),
    body('perms').isArray().optional(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        req.body.created = new Date();
        req.body.status = 'ACTIVE';
        req.body.perms = req.body.perms ? req.body.perms : [];

        try {
            const user = await userService.createUser(req.body);
        } catch (error) {
            console.error(error);
            return res.sendStatus(400);
        }

        res.sendStatus(200);
    }
);

app.put('/user/:id',
    body('name').isString().isLength({ min: 1, max: 256 }).optional(),
    body('title').isString().isLength({ min: 1, max: 256 }).optional(),
    body('status').isString().isLength({ min: 1, max: 256 }).optional(),
    authMiddleware(['admin']),
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

app.delete('/user/:id',
    authMiddleware(['admin']),
    async (req, res) => {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send('invalid id');
        }

        const asset = await userService.deleteUser(id);
        res.send(asset);
    }
);

//event routes

app.get('/event',
    query('page').isInt().optional(),
    query('amount').isInt().optional(),
    query('eType').isString().optional(),
    query('oType').isString().optional(),
    query('sDate').isISO8601().toDate().optional(),
    query('eDate').isISO8601().toDate().optional(),
    authMiddleware(['admin']),
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

//auth routes

app.post('/login',
    body('user').isString().isLength({ min: 2, max: 50 }),
    body('pass').isString().isLength({ min: 6, max: 50 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let session;
        try {
            session = await authService.login(req.body.user, req.body.pass);
        } catch (error) {
            console.error(error);
            res.sendStatus(400);
        }

        res.cookie('sessionId', session._id, { httpOnly: true }).sendStatus(200);
    }
);

app.listen(port, () => {
    console.log(`listening on ${port}`);
})
