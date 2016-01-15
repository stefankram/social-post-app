//
// Created by stefa_000 on 12/5/2015 22:52
//

angular
    .module('SocialNetworkApp')
    .controller('ModifyStatus', ['$scope', '$http', function ($scope, $http) {

        $scope.delete = function (id, social) {

            if (social == "facebook") {
                $http.delete('/delete/status/facebook', {
                        params: {id: id}
                    })
                    .success(function () {
                        $('#' + id).remove();
                    });
            }

            if (social == "twitter") {
                $http.delete('/delete/status/twitter', {
                        params: {id: id}
                    })
                    .success(function () {
                        $('#' + id).remove();
                    });
            }
        };

        $scope.updateData = {};

        $scope.update = function (social) {

            var data = {
                id: $scope.updateData.id,
                text: $('#facebook-update-text').val()
            };

            if (social == "facebook") {
                $http({
                    method: 'POST',
                    url: '/update/status/facebook',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify(data)
                }).success(function () {
                    $('#facebook-update').hide();
                    $('#' + data.id + ' > .content > .text').html(data.text);
                });
            }
        };
    }]);