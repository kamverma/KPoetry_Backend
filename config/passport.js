const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('../config/connection');

// passport-jwt is a passport strategy to authenticate with JSON Web Tokens (JWT)

module.exports = function(passport) {
    // Object literal to define how tokens will be extracted from a request
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.secret;

    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        // console.log(jwt_payload);
        // Get the user by function defined in user model
        require('../models/user').findUserById(jwt_payload.id, (err, user) => {
            if(err) {
                return done(err, false);
            }
            // If user is found
            if(user) {
                done(null, jwt_payload.user);
            } else {                  // Not found
                done(null, false);
            }
        })
    }));
}
 

