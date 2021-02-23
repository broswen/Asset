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

module.exports = authMiddleware;