const Creds = require("../models/Credentials");
class AuthService {

    constructor() { }

    async register(user, pass) {
        //create Credentials model
        //bcrypt password
        //save user
    }

    async login(user, pass) {
        //bcrypt password
        //lookup hash by user
        //compare hashes
        //if valid, generate jwt with claims from Credentials
    }

    async verify(jwt) {
        //verify JWT is valid
    }

}

module.exports = AuthService;