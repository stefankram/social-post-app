//
// Created by stefa_000 on 11/26/2015 0:21
//

angular
    .module('SocialNetworkApp', [])
    .controller('ShareStatus', ['$scope', '$http', function ($scope, $http) {

        $scope.share = {};

        $scope.submit = function() {
            var share = {
                status: $scope.share.status,
                facebook: $('#share-check-facebook').hasClass('checked'),
                twitter: $('#share-check-twitter').hasClass('checked'),
                linkedin: $('#share-check-linkedin').hasClass('checked')
            };

            if (!share.status || (!share.facebook && !share.twitter && !share.linkedin)) {
                console.log("Error");
                return;
            }

            $http({
                method: 'POST',
                url: '/share',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(share)
            }).success(function (res) {
                if (res.facebook.statusId) {
                    $('#facebook-statuses').append('<div id="' + res.facebook.statusId + '" class="comment">' +
                        '<span class="avatar"><img src="img/profile.png"></span>' +
                        '<div class="content">' +
                        '<span class="author">' + res.facebook.displayName + '</span>' +
                        '<div class="text">' + share.status + '</div>' +
                        '<div class="actions">' +
                        '<a href="javascript:void(0)" ng-click="delete(\'' + res.facebook.statusId + '\', \'facebook\')">delete</a>' +
                        '<a href="javascript:void(0)" onclick="$(\'#facebook-update\').show()" ng-click="updateData.id = \'' + res.facebook.statusId + '\'">update</a>' +
                        '</div></div></div>');
                }
                if (res.twitter.statusId) {
                    $('#twitter-statuses').append('<div id="' + res.twitter.statusId + '" class="comment">' +
                        '<span class="avatar"><img src="img/profile.png"></span>' +
                        '<div class="content">' +
                        '<span class="author">' + res.twitter.displayName + '</span>' +
                        '<div class="text">' + share.status + '</div>' +
                        '<div class="actions">' +
                        '<a href="javascript:void(0)" ng-click="delete(\'' + res.twitter.statusId + '\', \'twitter\')">delete</a>' +
                        '</div></div></div>');
                }
                if (res.linkedin.statusId) {
                    $('#linkedin-statuses').append('<div id="' + res.linkedin.statusId + '" class="comment">' +
                        '<span class="avatar"><img src="img/profile.png"></span>' +
                        '<div class="content">' +
                        '<span class="author">' + res.linkedin.displayName + '</span>' +
                        '<div class="text">' + share.status + '</div>' +
                        '</div></div>')
                }
            });
        };
    }]);