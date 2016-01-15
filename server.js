//
// Created by stefa_000 on 11/25/2015 15:40
//

var express = require('express'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    LinkedinStrategy = require('passport-linkedin-oauth2').Strategy,
    sequence = require('sequence').Sequence,
    Google = require('./google'),
    Facebook = require('./facebook'),
    Twitter = require('./twitter'),
    Linkedin = require('./linkedin'),
    mongojs = require('mongojs');

var db = mongojs('SocialNetworkApp', ['FacebookUser', 'TwitterUser', 'LinkedinUser']);

// Configure passport
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// Configure GoogleStrategy passport
passport.use(new GoogleStrategy({
        clientID: Google.GOOGLE_CLIENT_ID,
        clientSecret: Google.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://skramrei-se3316-lab4-skramrei.c9users.io:8080/login/google/callback'
    },
    function (token, refreshToken, profile, done) {
        var data = {
            token: token,
            refreshToken: refreshToken,
            profile: profile
        };
        return done(null, data);
    }));

// Configure FacebookStrategy passport
passport.use(new FacebookStrategy({
        clientID: Facebook.FACEBOOK_APP_ID,
        clientSecret: Facebook.FACEBOOK_APP_SECRET,
        callbackURL: 'https://skramrei-se3316-lab4-skramrei.c9users.io:8080/login/facebook/callback'
    },
    function (token, refreshToken, profile, done) {
        var data = {
            token: token,
            refreshToken: refreshToken,
            profile: profile
        };
        return done(null, data);
    }));

// Configure TwitterStrategy passport
passport.use(new TwitterStrategy({
        consumerKey: Twitter.TWITTER_CONSUMER_KEY,
        consumerSecret: Twitter.TWITTER_CONSUMER_SECRET,
        callbackURL: 'https://skramrei-se3316-lab4-skramrei.c9users.io:8080/login/twitter/callback'
    },
    function (token, tokenSecret, profile, done) {
        var data = {
            token: token,
            tokenSecret: tokenSecret,
            profile: profile
        };
        return done(null, data);
    }));

// Configure LinkedinStrategy passport
passport.use(new LinkedinStrategy({
        clientID: Linkedin.LINKEDIN_CLIENT_ID,
        clientSecret: Linkedin.LINKEDIN_CLIENT_SECRET,
        callbackURL: 'https://skramrei-se3316-lab4-skramrei.c9users.io:8080/login/linkedin/callback',
        scope: ['w_share', 'r_basicprofile'],
        state: true
    },
    function (token, refreshToken, profile, done) {
        var data = {
            token: token,
            refreshToken: refreshToken,
            profile: profile
        };
        return done(null, data);
    }));

// Create express
var app = express();

// Set view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Set express added functionality
app.use(require('cookie-parser')());
app.use(require('body-parser').json());
app.use(require('express-session')({secret: 'session', resave: true, saveUninitialized: true}));
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session());

// Configure GoogleStrategy login
app.get('/login/google', passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']}));
app.get('/login/google/callback',
    passport.authenticate('google'),
    function (req, res) {
        Google.login(req.user.profile.id, req.user.profile.displayName, req.user.profile.photos[0].value);
        req.session.googleUser = req.user;
        res.redirect('/');
    });

// Configure FacebookStrategy login
app.get('/login/facebook',
    passport.authenticate('facebook', {scope: ['user_posts', 'publish_actions']}));
app.get('/login/facebook/callback',
    passport.authenticate('facebook'),
    function (req, res) {
        Facebook.login(req.user.profile.id, req.user.profile.displayName);
        req.session.facebookUser = req.user;
        res.redirect('/');
    });

// Configure TwitterStrategy login
app.get('/login/twitter', passport.authenticate('twitter'));
app.get('/login/twitter/callback',
    passport.authenticate('twitter'),
    function (req, res) {
        Twitter.login(req.user.profile.id, req.user.profile.displayName);
        req.session.twitterUser = req.user;
        res.redirect('/');
    });

// Configure LinkedinStrategy login
app.get('/login/linkedin', passport.authenticate('linkedin'));
app.get('/login/linkedin/callback',
    passport.authenticate('linkedin'),
    function (req, res) {
        Linkedin.login(req.user.profile.id, req.user.profile.displayName);
        req.session.linkedinUser = req.user;
        res.redirect('/');
    });

// Logout of all social networks
app.get('/logout', function (req, res) {
    req.logout();
    delete req.session.googleUser;
    delete req.session.facebookUser;
    delete req.session.twitterUser;
    delete req.session.linkedinUser;
    res.redirect('/');
});

// Render main page
app.get('/', function (req, res) {

    var googleUser = req.session.googleUser,
        facebookUser = req.session.facebookUser,
        twitterUser = req.session.twitterUser,
        linkedinUser = req.session.linkedinUser,
        seq = sequence.create();

    seq.then(function (next) {
            if (facebookUser) {

                Facebook.loadComments(facebookUser.profile.id, facebookUser.token);

                db['FacebookUser'].find({facebookId: facebookUser.profile.id}, function (err, docs) {
                    if (docs.length == 1) {
                        facebookUser.statuses = docs[0].statuses;
                        next();
                    }
                });
            } else {
                next();
            }
        })
        .then(function (next) {
            if (twitterUser) {
                db['TwitterUser'].find({twitterId: twitterUser.profile.id}, function (err, docs) {
                    if (docs.length == 1) {
                        twitterUser.statuses = docs[0].statuses;
                        next();
                    }
                });
            } else {
                next();
            }
        })
        .then(function (next) {
            if (linkedinUser) {
                db['LinkedinUser'].find({linkedinId: linkedinUser.profile.id}, function (err, docs) {
                    if (docs.length == 1) {
                        linkedinUser.statuses = docs[0].statuses;
                        next();
                    }
                });
            } else {
                next();
            }
        })
        .then(function () {

            console.log("FacebookUser: " + JSON.stringify(facebookUser, null, 4));
            console.log("TwitterUser: " + JSON.stringify(twitterUser, null, 4));
            console.log("LinkedinUser: " + JSON.stringify(linkedinUser, null, 4));

            res.render('index', {
                googleUser: googleUser,
                facebookUser: facebookUser,
                twitterUser: twitterUser,
                linkedinUser: linkedinUser
            });
        });
});

// Get status from client
app.post('/share', function (req, res) {

    var share = req.body,
        facebookUser = req.session.facebookUser,
        twitterUser = req.session.twitterUser,
        linkedinUser = req.session.linkedinUser,
        seq = sequence.create();

    var response = {
        facebook: {
            displayName: "",
            statusId: false
        },
        twitter: {
            displayName: "",
            statusId: false
        },
        linkedin: {
            displayName: "",
            statusId: false
        }
    };

    seq.then(function (next) {
            if (facebookUser && share.facebook) {
                response.facebook.displayName = facebookUser.profile.displayName;
                Facebook.setPost(facebookUser.profile.id, facebookUser.token, share.status, response, next);
            } else {
                next();
            }
        })
        .then(function (next) {
            if (twitterUser && share.twitter) {
                response.twitter.displayName = twitterUser.profile.displayName;
                Twitter.setStatus(twitterUser.profile.id, twitterUser.token, twitterUser.tokenSecret, share.status, response, next);
            } else {
                next();
            }
        })
        .then(function (next) {
            if (linkedinUser && share.linkedin) {
                response.linkedin.displayName = linkedinUser.profile.displayName;
                Linkedin.setStatus(linkedinUser.profile.id, linkedinUser.token, share.status, response, next);
            } else {
                next();
            }
        })
        .then(function () {
            res.json(response);
        });
});

// Update facebook status
app.post('/update/status/facebook', function (req, res) {

    var data = req.body,
        facebookUser = req.session.facebookUser;

    Facebook.updatePost(facebookUser.profile.id, facebookUser.token, data.id, data.text);

    res.send("");
});

// Delete facebook status
app.delete('/delete/status/facebook', function (req, res) {

    var facebookUser = req.session.facebookUser;

    Facebook.deletePost(facebookUser.profile.id, facebookUser.token, req.query.id);

    res.send("");
});

// Delete twitter status
app.delete('/delete/status/twitter', function (req, res) {

    var twitterUser = req.session.twitterUser;

    Twitter.deletePost(twitterUser.profile.id, twitterUser.token, twitterUser.tokenSecret, req.query.id);

    res.send("");
});

// Start listening on port 8080
app.listen(8080, function () {
    console.log("Listening on port 8080...");
});