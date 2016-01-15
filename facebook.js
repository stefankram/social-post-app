//
// Created by stefa_000 on 11/26/2015 20:29
//

var request = require('request'),
    mongojs = require('mongojs');

var db = mongojs('SocialNetworkApp', ['FacebookUser']);

module.exports = {

    FACEBOOK_APP_ID: "",
    FACEBOOK_APP_SECRET: "",

    login: function (userId, userName) {
        db['FacebookUser'].find({facebookId: userId}, function (err, docs) {
            if (!docs.length) {
                db['FacebookUser'].insert({
                    facebookId: userId,
                    name: userName,
                    statuses: []
                });
            }
        });
    },

    setPost: function (userId, token, status, response, next) {
        request.post({
                url: 'https://graph.facebook.com/v2.5/' + userId + '/feed',
                qs: {
                    access_token: token,
                    message: status
                }
            },
            function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    response.facebook.statusId = JSON.parse(body).id;
                    db['FacebookUser'].update({facebookId: userId}, {
                        $push: {
                            statuses: {
                                statusId: JSON.parse(body).id,
                                status: status,
                                createdAt: new Date().toISOString(),
                                comments: []
                            }
                        }
                    });
                }
                next();
            });
    },

    deletePost: function (userId, token, statusId) {
        request.del({
                url: 'https://graph.facebook.com/v2.5/' + statusId + '?access_token=' + token
            },
            function (err, res) {
                if (!err && res.statusCode == 200) {
                    db['FacebookUser'].update({facebookId: userId}, {
                        $pull: {
                            statuses: {
                                statusId: statusId
                            }
                        }
                    });
                }
            });
    },

    updatePost: function (userId, token, statusId, text) {
        request.post({
                url: 'https://graph.facebook.com/v2.5/' + statusId,
                qs: {
                    access_token: token,
                    message: text
                }
            },
            function (err, res) {
                if (!err && res.statusCode == 200) {
                    db['FacebookUser'].update({facebookId: userId, 'statuses.statusId': statusId}, {
                        $set: {
                            'statuses.$.status': text
                        }
                    });
                }
            });
    },

    loadComments: function (userId, token) {
        db['FacebookUser'].find({facebookId: userId}, function (err, docs) {
            if (docs.length == 1) {
                for (var i = 0; i < docs[0].statuses.length; i++) {
                    (function (i) {
                        request.get({
                                url: 'https://graph.facebook.com/v2.5/' + docs[0].statuses[i].statusId + '/comments?access_token=' + token
                            },
                            function (err, res, body) {
                                if (!err && res.statusCode == 200) {
                                    var data = JSON.parse(body).data;
                                    for (var j = 0; j < data.length; j++) {
                                        db['FacebookUser'].update({
                                            facebookId: userId,
                                            'statuses.statusId': docs[0].statuses[i].statusId
                                        }, {
                                            $addToSet: {
                                                'statuses.$.comments': {
                                                    commentId: data[j].id,
                                                    displayName: data[j].from.name,
                                                    userId: data[j].from.id,
                                                    comment: data[j].message,
                                                    createdAt: data[j].created_time
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                    })(i);
                }
            }
        });
    }
};
