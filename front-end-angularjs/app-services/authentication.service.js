(function () {
    'use strict';

    angular
        .module('app')
        .factory('AuthenticationService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.Login = Login;
        service.Logout = Logout;
        service.getUser = getUser;

        return service;

        function Login(username, password, callback) {
            var data = JSON.stringify({ username: username, password: password });
            $http({
                url: 'http://127.0.0.1:5000/api/authenticate',
                method: "POST",
                data: data,
                headers: {'Content-Type': 'application/json'}
            }).then(function (response) {
                    // login successful if there's a token in the response
                    if (response.status === 200) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $localStorage.currentUser = { username: username, token: response.data.access_token };

                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.data.access_token;

                        // execute callback with true to indicate successful login
                        callback(true);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false);
                    }
            }).catch(function(e) {
                callback(false);
            });
        }

        function getUser(callback) {
            $http ({
                method : "GET",
                url : "http://127.0.0.1:5000/api/getuser",
            }).then(function mySuccess(response) {
                callback(true, response);
            }, function myError(response) {
                callback(false, response);
            });
        }

        function Logout() {
            // remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            $http.defaults.headers.common.Authorization = '';
        }
    }
})();