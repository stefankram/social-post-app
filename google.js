//
// Created by stefa_000 on 12/2/2015 20:35
//

var request = require('request'),
    mongojs = require('mongojs');

var db = mongojs('SocialNetworkApp', ['GoogleUser']);

module.exports = {

    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",

    login: function (userId, userName, userPhoto) {
        db['GoogleUser'].find({googleId: userId}, function (err, docs) {
            if (!docs.length) {
                db['GoogleUser'].insert({
                    googleId: userId,
                    name: userName,
                    photo: userPhoto
                });
            }
        });
    }
};