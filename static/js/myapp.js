var myApp = angular.module("myApp", ["ngRoute"]);

myApp.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'login'
      })
	  .when('/accounts', {
        templateUrl: 'accounts',
		controller: 'accountController'
      })
      .when('/login', {
        templateUrl: 'login',
        controller: 'loginController'
      })
  });