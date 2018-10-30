var myApp = angular.module("myApp", ["ngRoute"]);

myApp.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'static/login/login.html',
        controller: 'loginController'
      })
      .when('/login', {
        templateUrl: 'static/login/login.html',
        controller: 'loginController'
      })
      .when('/logout', {
        controller: 'logoutController'
      })
      .when('/register', {
        templateUrl: 'static/partials/register.html',
        controller: 'registerController'
      })
      .when('/one', {
        template: '<h1>This is page one!</h1>'
      })
      .when('/two', {
        template: '<h1>This is page two!</h1>'
      })
      .when('/user', {
        templateUrl: 'static/partials/user.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  });