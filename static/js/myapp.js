var myApp = angular.module("myApp", ["ngRoute"]);

myApp.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'login',
        controller: 'loginController'
      })
      .when('/bankacc', {
        templateUrl: 'bankacc',
        controller: 'accountController'
      })
      .when('/login', {
        templateUrl: 'login',
        controller: 'loginController'
      })
});

myApp.controller("loginController",
    function ($scope, $http, $window) {
      var token = '';
      $scope.hasError = false;
      $scope.submit = function() {
        $http({
            method : "POST",
            url : "/checklogin",
            data: {'username': $scope.user.username,
                    'password': $scope.user.password,
                    }
        })
        .then(function mySuccess(response) {
            token = response.data.access_token;
            sessionStorage.setItem('access_token', token);
            $window.location.href = '#/bankacc';
        })
        .catch(function myError(response) {
            $scope.msg = response.data.msg;
            $scope.hasError = true;
        })
      }
  })

  myApp.controller("accountController",
    function ($scope, $http) {
      $scope.hasError = false;
      $scope.accounts = {};
      console.log('nga')
      $http({
        method : "GET",
        url : "/getall"
      }).then(function mySuccess(response) {
        console.log(response.data);
        $scope.accounts = response.data.records;
      }, function myError(response) {
        $scope.hasError = true;
      });
  })
