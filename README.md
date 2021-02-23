#Asset

Asset management back-end using Nodejs, Express, and MongoDB (Mongoose).

Create assets and check in/out assets to users.

All events logs and queried.

Searching by name and pagination for Users and Assets.


### TODO List
- [ ] split routes into respective modules
- [x] add PUT/update routes for assets and users
- [x] add params to use small projection for pagination
- [x] add login and auth routes
- [x] add login and session
- [x] create auth middleware, put session into req
- [x] create access logging middleware. log ip, route, sessionId, date
- [ ] use text index for name/description searching
- [ ] add/remove some trycatch and cleanup thrown errors
- [ ] add logout route, remove session and clear cookie