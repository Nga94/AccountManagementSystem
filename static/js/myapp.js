var myApp = angular.module("myApp", ["datatables", "ngRoute"]);

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
    function ($scope, $http, $window, $compile, DTOptionsBuilder, DTColumnBuilder) {
      var token = sessionStorage.getItem("access_token");
      var t = token != null ? "Bearer " + sessionStorage.getItem("access_token") : "";
        $scope.showAdd = true;
        $scope.alertError = true;
        $scope.hasAlert = false;
        $scope.info = {};
        $scope.account = {};
        $scope.query = {};
        $scope.rs = {};
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
        .withOption(
          'ajax', {
            url: '/getall',
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            xhrFields: {
                withCredentials: true
            },
            headers: {
                "Authorization": t
            },
            error: function (xhr) {
                if (xhr.status == 401) {
                    alert("Session expireed!")
                    sessionStorage.removeItem("access_token");
                    $window.location.href = '#/login';
                }
            },
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
        return `<button class="btn btn-icon btn-sm btn-warning" ng-click="edit('${row.account_number}')" ><i class="fa fa-edit"></i></button>
                <button class="btn btn-icon btn-sm btn-danger" ng-click="deleteConfirm('${row.account_number}')" ><i class="fa fa-trash-o"></i></button>`;
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
        DTColumnBuilder.newColumn("action").renderWith(actionRender).withClass("text-center").withTitle('Action').withOption('width', '150px').notSortable()
    ];

    //confirm delete
    $scope.deleteConfirm = function (id) {
        $scope.info.id = id;
        $('#modal-delete').modal({backdrop: 'static', keyboard: false});
    }

    //delete
    $scope.deleteAccount = function () {
        $http({
            method: 'DELETE',
            url: '/delete/' + $scope.info.id,
            headers: {
                "Authorization": t
            }
        }).then(function (response) {
            $scope.msg = response.data.msg;
            $scope.alertError = false;
            $scope.hasAlert = true;
            $('#modal-delete').modal('hide');
            $scope.reloadData();
        }, function (error) {
            if (error.status == 401) {
                alert("Session expired!")
                sessionStorage.removeItem("access_token");
                $window.location.href = '#/login';
            } else if (error.status == 400) {
                $scope.msg = "An error occur : " + error.data.msg;
                $scope.hasAlert = true;
                $scope.alertError = true;
                $('#modal-create').modal('hide');
            }
        });
    }

    //click add new button
    $scope.add = function () {
        $scope.account = {gender: 'F'};
        $scope.showAdd = true;
        $('#modal-create').modal({backdrop: 'static', keyboard: false});
    }

    //click edit button
    $scope.edit = function (id) {
        $scope.info.id = id;
        $scope.showAdd = false;
        $http({
            method: 'GET',
            url: '/detail/' + $scope.info.id,
            headers: {
                "Authorization": t
            }
        }).then(function (response) {
            $scope.account = response.data.data[0];
            $('#modal-create').modal({backdrop: 'static', keyboard: false});
        }, function (error) {
            if (error.status == 401) {
                alert("Session expired!")
                sessionStorage.removeItem("access_token");
                $window.location.href = '#/login';
            } else if (error.status == 400) {
                $scope.msg = "An error occur : " + error.data.msg;
                $scope.hasAlert = true;
                $scope.alertType = true;
                $('#modal-create').modal('hide');
            }
        });
    }

    //submit form
        $scope.submitForm = function (isvalid) {
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
                        $scope.alertError = false;
                        $scope.hasAlert = true;
                        $('#modal-create').modal('hide');
                        $scope.reloadData();
                    }, function (error) {
                        if (error.status == 401) {
                            alert("Session expired!")
                            sessionStorage.removeItem("access_token");
                            $window.location.href = '#/login';
                        } else if (error.status == 400) {
                            $scope.msg = "An error occur : " + error.data.msg;
                            $scope.hasAlert = true;
                            $scope.alertError = true;
                            $('#modal-create').modal('hide');
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
                        $scope.alertError = false;
                        $scope.hasAlert = true;
                        $('#modal-create').modal('hide');
                        $scope.reloadData();
                    }, function (error) {
                        if (error.status == 401) {
                            alert("Session expired!")
                            sessionStorage.removeItem("access_token");
                            $window.location.href = '#/login';
                        } else if (error.status == 400) {
                            $scope.msg = "An error occur : " + error.data.msg;
                            $scope.hasAlert = true;
                            $scope.alertError = true;
                            $('#modal-create').modal('hide');
                        }
                    })
                }
            } else {
                alert("Invalid")
            }
        }

  })
