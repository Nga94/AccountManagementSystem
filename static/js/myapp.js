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
            $window.location.href = '#!bankacc';
        })
        .catch(function myError(response) {
            $scope.msg = response.data.msg;
            $scope.hasError = true;
        })
      }
  })

  myApp.controller("accountController",
    function ($scope, $http) {
      var token = sessionStorage.getItem("access_token");
      var t = token != null ? "Bearer " + sessionStorage.getItem("access_token") : "";
      $scope.hasError = false;
      $scope.accounts = {};
      $http({
        method : "GET",
        url : "/getall",
        headers: {"Authorization": t}
      }).then(function mySuccess(response) {
        $scope.accounts = response.data;
        console.log($scope.accounts);
      }, function myError(response) {
        $scope.hasError = true;
      });
  })
