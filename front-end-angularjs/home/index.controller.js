(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller(AuthenticationService) {
        var vm = this;
        vm.username = '';

        initController();

        function initController() {
            AuthenticationService.getUser(function(success, result) {
                if (success) {
                    vm.username = result.data.name;
                } else {
                    vm.error = result.data.msg;
                }
            })
        }
    }

})();