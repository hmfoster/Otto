groceries.controller('loginController', ['$scope', '$http', 'auth', 'store', '$location', 'States',
  function ($scope, $http, auth, store, $location, States) {
    $scope.zipSubmitEnabled = "disabled";
    $scope.zipSubmitted = false;
    $scope.checkZip = function(){
      if (/\d{5}/.test($scope.zip)){
        $scope.zipSubmitEnabled = "";
      }
      else $scope.zipSubmitEnabled = "disabled";
    };

    // set state to 'login' when loading this view
    States.setState('login');
    $scope.auth = auth;
    $scope.login = function () {
      auth.signin({}, function (profile, token) {
        // Success callback
        store.set('token', token);
        store.set('profile', profile);
        getUser();
      }, function (err) {
        // Error callback
        console.log('Error in loginController: ', err);
      });
    };

    $scope.logout = function() {
      auth.signout();
      store.remove('profile');
      store.remove('token');
      store.remove('householdId');
      $location.path('/');
    };

    $scope.updateUser = function(){
      $scope.zipSubmitted = true;
      $http.post('/user', {userId: $scope.auth.profile.user_id.split('|')[1],
                           fullName: $scope.auth.profile.name,
                           email: $scope.auth.profile.email,
                           picture: $scope.auth.profile.picture,
                           zip: $scope.zip })
      .then(function(res){
        $scope.auth.profile.household = {householdId: res.data};
        store.set('householdId', res.data);
        store.set('zip', $scope.zip);
        $location.path('/landing');
      },
        function (err){
          Materialize.toast('Ooops, check your connection and try again.', 10000);
          console.log(err);
        }
      );
    };
    var getUser = function(){
      $http.get('/user/' + $scope.auth.profile.user_id.split('|')[1])
      .then(function(res){
        if (res.data.zip){
          $scope.zip = res.data.zip;
          $scope.updateUser();
        }
        else $location.path('/zip');
      }, function(err){
        $location.path('/zip');
      });
    };

  }
]);