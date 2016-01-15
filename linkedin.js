//
// Created by stefa_000 on 12/6/2015 14:13
//

var request = require('request'),
    mongojs = require('mongojs');

var db = mongojs('SocialNetworkApp', ['LinkedinUser']);

module.exports = {

    LINKEDIN_CLIENT_ID: "",
    LINKEDIN_CLIENT_SECRET: "",

    login: function (userId, userName) {
        db['LinkedinUser'].find({linkedinId: userId}, function (err, docs) {
            if (!docs.length) {
                db['LinkedinUser'].insert({
                    linkedinId: userId,
                    name: userName,
                    statuses: []
                });
            }
        });
    },

    setStatus: function (userId, token, status, response, next) {

        var data = {
            comment: status,
            visibility: {
                code: "anyone"
            }
        };

        request.post({
                url: 'https://api.linkedin.com/v1/people/~/shares?oauth2_access_token=' + token + '&format=json',
                headers: {
                    'Content-Type': 'application/json',
                    'x-li-format': 'json'
                },
                body: JSON.stringify(data)
            },
            function (err, res, body) {
                if (!err && res.statusCode == 201) {
                    response.linkedin.statusId = JSON.parse(body).updateKey;
                    db['LinkedinUser'].update({linkedinId: userId}, {
                        $push: {
                            statuses: {
                                statusId: JSON.parse(body).updateKey,
                                status: status,
                                createdAt: new Date().toISOString()
                            }
                        }
                    });
                }
                next();
            });
    }
};