var app = angular.module("bankApp", ["datatables", "ngRoute"]);
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "login"
        })
        .when("/bankacc", {
            templateUrl: "bankacc",
            controller: "bankaccController",
            resolve: {
                //This function is injected with the AuthService where you'll put your authentication logic
                'auth': function (AuthService) {
                    return AuthService.authenticate();
                }
            }
        })
        .when("/login", {
            templateUrl: "login",
            controller: "loginController"
        })
        .otherwise({
            templateUrl: "login"
        });
    $locationProvider.hashPrefix('');
}).run(function ($rootScope, $location) {
    //If the route change failed due to authentication error, redirect them out
    $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
        if (rejection === 'Not Authenticated') {
            $location.path('#/login');
        }
    })
}).factory('AuthService', function ($q) {
    return {
        authenticate: function () {
            //Authentication logic here
            isAuthenticated = sessionStorage.getItem("isLogin") == "1" ? true : false;
            if (isAuthenticated) {
                //If authenticated, return anything you want, probably a user object
                return true;
            } else {
                //Else send a rejection
                return $q.reject('Not Authenticated');
            }
        }
    }
});
app.controller("bankaccController",
    function ($scope, $http, $window, $compile, DTOptionsBuilder, DTColumnBuilder) {
        $scope.info = {};
        $scope.account = {};
        $scope.showAdd = true;
        $scope.alertType = true;
        $scope.hasAlert = false;
        $scope.query = {};
        $scope.rs = {};

        var token = sessionStorage.getItem("access_token");
        var t = token != null ? "Bearer " + sessionStorage.getItem("access_token") : "";

        //click edit button
        $scope.editAcc = function (id) {
            $scope.info.id = id;
            $scope.showAdd = false;
            $http({
                method: 'GET',
                url: '/getone/' + $scope.info.id,
                headers: {
                    "Authorization": t
                }
            }).then(function (response) {
                $scope.account = response.data.data[0];
                $('#addpopup').modal({backdrop: 'static', keyboard: false});
            }, function (error) {
                if (error.status == 401) {
                    alert("Session expired!")
                    sessionStorage.removeItem("isLogin");
                    sessionStorage.removeItem("access_token");
                    $window.location.href = '#/login';
                } else if (error.status == 400) {
                    $scope.msg = "An error occur : " + error.data.msg;
                    $scope.hasAlert = true;
                    $scope.alertType = true;
                    $('#addpopup').modal('hide');
                }
            });
        }
        //click add new button
        $scope.addAcc = function () {
            $scope.account = {gender: 'F'};
            $scope.showAdd = true;
            $('#addpopup').modal({backdrop: 'static', keyboard: false});
        }
        //confirm delete account
        $scope.confirmDelete = function (id) {
            $scope.info.id = id;
            $('#deleteConfirm').modal({backdrop: 'static', keyboard: false});
        }
        //delete account
        $scope.deleteAccount = function () {
            $http({
                method: 'DELETE',
                url: '/delete/' + $scope.info.id,
                headers: {
                    "Authorization": t
                }
            }).then(function (response) {
                $scope.msg = response.data.msg;
                $scope.alertType = false;
                $scope.hasAlert = true;
                console.log($scope.msg);
                $('#deleteConfirm').modal('hide');
                $scope.reloadData();
            }, function (error) {
                if (error.status == 401) {
                    alert("Session expired!")
                    sessionStorage.removeItem("isLogin");
                    sessionStorage.removeItem("access_token");
                    $window.location.href = '#/login';
                } else if (error.status == 400) {
                    $scope.msg = "An error occur : " + error.data.msg;
                    $scope.hasAlert = true;
                    $scope.alertType = true;
                    $('#addpopup').modal('hide');
                }
            });
        }
        //save form
        $scope.saveForm = function (isvalid) {
            //check form issvalid
            if (isvalid) {
                //check update or insert
                if ($scope.showAdd) {
                    //insert
                    $http({
                        method: 'POST',
                        url: '/insert',
                        data: {account: $scope.account},
                        headers: {
                            "Authorization": "Bearer " + sessionStorage.getItem("access_token")
                        }
                    }).then(function (response) {
                        $scope.msg = response.data.msg;
                        $scope.alertType = false;
                        $scope.hasAlert = true;
                        $('#addpopup').modal('hide');
                        $scope.reloadData();
                    }, function (error) {
                        if (error.status == 401) {
                            alert("Session expired!")
                            sessionStorage.removeItem("isLogin");
                            sessionStorage.removeItem("access_token");
                            $window.location.href = '#/login';
                        } else if (error.status == 400) {
                            $scope.msg = "An error occur : " + error.data.msg;
                            $scope.hasAlert = true;
                            $scope.alertType = true;
                            $('#addpopup').modal('hide');
                        }
                    })
                } else {
                    //update
                    $http({
                        method: 'PUT',
                        url: '/update/' + $scope.info.id,
                        data: {account: $scope.account},
                        headers: {
                            "Authorization": t
                        }
                    }).then(function (response) {
                        $scope.msg = response.data.msg;
                        $scope.alertType = false;
                        $scope.hasAlert = true;
                        $('#addpopup').modal('hide');
                        $scope.reloadData();
                    }, function (error) {
                        if (error.status == 401) {
                            alert("Session expired!")
                            sessionStorage.removeItem("isLogin");
                            sessionStorage.removeItem("access_token");
                            $window.location.href = '#/login';
                        } else if (error.status == 400) {
                            $scope.msg = "An error occur : " + error.data.msg;
                            $scope.hasAlert = true;
                            $scope.alertType = true;
                            $('#addpopup').modal('hide');
                        }
                    })
                }
            } else {
                alert("Invalid")
            }
        }
        $scope.logout = function () {
            sessionStorage.removeItem("isLogin");
            sessionStorage.removeItem("access_token");
            $window.location.href = '#/login';
        }

        // Store datatable instance
        $scope.dtInstance = {};
        $scope.reloadData = reloadData;

        function reloadData() {
            var resetPaging = false;
            $scope.dtInstance.reloadData(callback, resetPaging);
        }

        function callback(json) {
            console.log(json);
        }

        var defaultLanguage = {
            "sEmptyTable": "No data available in table",
            "sInfo": "Showing _START_ to _END_ of _TOTAL_ records",
            "sInfoEmpty": "Showing 0 to 0 of 0 records",
            "sInfoFiltered": "(filtered from _MAX_ total records)",
            "sInfoPostFix": "",
            "sInfoThousands": ",",
            "sLengthMenu": "Show _MENU_ records",
            "sLoadingRecords": "Loading...",
            "sProcessing": "Processing...",
            "sSearch": "Search:",
            "searchPlaceholder": 'Search...',
            "sZeroRecords": "No matching records found",
            "oPaginate": {
                "sFirst": '<i class="fa fa-step-backward t-d-c" aria-hidden="true"></i>',
                "sLast": '<i class="fa fa-step-forward t-d-c" aria-hidden="true"></i>',
                "sNext": '<i class="fa fa-caret-right t-d-c font16" aria-hidden="true"></i>',
                "sPrevious": '<i class="fa fa-caret-left t-d-c font16" aria-hidden="true"></i>'
            },
            "oAria": {
                "sSortAscending": ": activate to sort column ascending",
                "sSortDescending": ": activate to sort column descending"
            }
        };
        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: '/getall',
                type: 'POST',
                // Content type
                contentType: 'application/json',
                // Type of data to send to server
                dataType: 'json',
                // Attach cookie with headers
                xhrFields: {
                    withCredentials: true
                },
                headers: {
                    "Authorization": t
                },
                error: function (xhr) {
                    if (xhr.status == 401) {
                        alert("Session expireed!")
                        sessionStorage.removeItem("isLogin");
                        sessionStorage.removeItem("access_token");
                        $window.location.href = '#/login';
                    }
                },
                // Make request, modify request data here
                data: function (data) {
                    $scope.draw = data.draw;
                    $scope.query.from = data.start;
                    $scope.query.size = data.length;
                    $scope.query.search = data.search.value;
                    return JSON.stringify($scope.query);
                }
            })
            .withDataProp(function (response) {
                rs = response.data;
                return rs;
            })
            .withLanguage(defaultLanguage)
            .withOption('ordering', false)
            .withOption('paging', true)
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withPaginationType('full_numbers')
            .withOption('fnDrawCallback', function (settings) {
                $compile(angular.element('#' + settings.sTableId).contents())($scope);
            });
        function actionRender(data, type, row) {
            //return `<a class="btn btn-danger" ng-click="alert()" >Alert</a>`;
            return `<button class="btn btn-icon btn-sm btn-warning" ng-click="editAcc('${row.account_number}')" ><i class="fa fa-edit"></i></button>
                     <button class="btn btn-icon btn-sm btn-danger" ng-click="confirmDelete('${row.account_number}')" ><i class="fa fa-trash-o"></i></button>`;
        }

        var indexRender = function indexRender(data, type, full, meta) {
            var index = meta.settings._iDisplayStart + meta.row;
            if (meta.settings.aaSorting[0][1] === 'desc') {
                return meta.settings._iRecordsTotal - index;
            } else {
                return index + 1;
            }
        };
        var nameRender = function (data, type, row) {
            return row.firstname + ' ' + row.lastname;
        }
        var accnumRender = function (data, type, row) {
            return row.account_number;
        }
        var ageRender = function (data, type, row) {
            return row.age;
        }
        var addressRender = function (data, type, row) {
            return row.address;
        }
        var genderRender = function (data, type, row) {
            return row.gender == "F" ? "Female" : "Male";
        }
        var emailRender = function (data, type, row) {
            return row.email;
        }
        var cityRender = function (data, type, row) {
            return row.city;
        }
        var employerRender = function (data, type, row) {
            return row.employer;
        }
        var stateRender = function (data, type, row) {
            return row.state;
        }
        var balanceRender = function (data, type, row) {
            return row.balance;
        }
        $scope.dtColumns = [
            DTColumnBuilder.newColumn("no").renderWith(indexRender).withClass("text-center").withTitle('#').notSortable(),
            DTColumnBuilder.newColumn('account_number').renderWith(accnumRender).withClass("text-center").withTitle('Account Number'),
            DTColumnBuilder.newColumn('fullname').renderWith(nameRender).withClass("text-center").withTitle('Fullname').notSortable(),
            DTColumnBuilder.newColumn('age').renderWith(ageRender).withClass("text-center").withTitle('Age'),
            DTColumnBuilder.newColumn('address').renderWith(addressRender).withClass("text-center").withTitle('Address').notSortable(),
            DTColumnBuilder.newColumn('gender').renderWith(genderRender).withClass("text-center").withTitle('Gender').notSortable(),
            DTColumnBuilder.newColumn('email').renderWith(emailRender).withClass("text-center").withTitle('Email').notSortable(),
            DTColumnBuilder.newColumn('city').renderWith(cityRender).withClass("text-center").withTitle('City').notSortable(),
            DTColumnBuilder.newColumn('state').renderWith(stateRender).withClass("text-center").withTitle('State').notSortable(),
            DTColumnBuilder.newColumn('employer').renderWith(employerRender).withClass("text-center").withTitle('Employer').notSortable(),
            DTColumnBuilder.newColumn('balance').renderWith(balanceRender).withClass("text-right").withTitle('Balance'),
            DTColumnBuilder.newColumn("action").renderWith(actionRender).withClass("text-center").withTitle('Action').withOption('width', '150px').notSortable(),
        ];

    });


app.controller("loginController",
    function ($scope, $http, $window) {
        $scope.user = {};
        $scope.hasAlert = false;
        $scope.login = function (isvalid) {
            $scope.hasAlert = false;
            if (isvalid) {
                $http({
                    method: "POST",
                    url: "/authenticate",
                    data: {"username": $scope.user.username, "password": $scope.user.password}
                }).then(function (response) {
                    token = response.data.access_token;
                    sessionStorage.setItem("isLogin", "1");
                    sessionStorage.setItem("access_token", token);
                    $window.location.href = '#/bankacc';
                }, function (reason) {
                    $scope.msg = reason.data.msg;
                    $scope.hasAlert = true;
                })
            }
        }
    })
