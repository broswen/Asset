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

module.exports = loggerMiddleware;