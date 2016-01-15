//
// Created by stefa_000 on 11/26/2015 21:06
//

var request = require('request'),
    mongojs = require('mongojs');

var db = mongojs('SocialNetworkApp', ['TwitterUser']);

var TWITTER_CONSUMER_KEY = "",
    TWITTER_CONSUMER_SECRET = "";

module.exports = {

    TWITTER_CONSUMER_KEY: TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET: TWITTER_CONSUMER_SECRET,

    login: function (userId, userName) {
        db['TwitterUser'].find({twitterId: userId}, function (err, docs) {
            if (!docs.length) {
                db['TwitterUser'].insert({
                    twitterId: userId,
                    name: userName,
                    statuses: []
                });
            }
        });
    },

    setStatus: function (userId, token, tokenSecret, status, response, next) {
        request.post({
                url: 'https://api.twitter.com/1.1/statuses/update.json',
                oauth: {
                    consumer_key: TWITTER_CONSUMER_KEY,
                    consumer_secret: TWITTER_CONSUMER_SECRET,
                    token: token,
                    token_secret: tokenSecret
                },
                qs: {
                    status: status
                }
            },
            function (err, res, body) {
                if (!err && res.statusCode == 200) {

                    response.twitter.statusId = JSON.parse(body).id_str;

                    db['TwitterUser'].update({twitterId: userId}, {
                        $push: {
                            statuses: {
                                statusId: JSON.parse(body).id_str,
                                status: status,
                                createdAt: new Date().toISOString()
                            }
                        }
                    });
                }
                next();
            });
    },

    deletePost: function (userId, token, tokenSecret, statusId) {
        request.post({
                url: 'https://api.twitter.com/1.1/statuses/destroy/' + statusId + '.json',
                oauth: {
                    consumer_key: TWITTER_CONSUMER_KEY,
                    consumer_secret: TWITTER_CONSUMER_SECRET,
                    token: token,
                    token_secret: tokenSecret
                }
            },
            function (err, res) {
                if (!err && res.statusCode == 200) {
                    db['TwitterUser'].update({twitterId: userId}, {
                        $pull: {
                            statuses: {
                                statusId: statusId
                            }
                        }
                    });
                }
            });
    }
};