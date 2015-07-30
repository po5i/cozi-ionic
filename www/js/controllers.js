angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $state, ngCart, $http, $stateParams) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $rootScope.api_url = "http://162.243.230.228";

  ngCart.setTaxRate(7.5);
  ngCart.setShipping(2.99);  

  // Form data for the login modal
  $scope.loginData = {};
  $scope.imgpath = window.location.href.replace(window.location.hash,""); //temp,debug

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.doReview = function () {
      $state.go('app.rate');
  };

  $scope.checkout = function() {
      $state.go('app.request2');
  }

  $scope.doCheckout = function() {
    console.log(ngCart.getItems());
  }

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };



  $scope.filters = { };

  var menuPromise = $http.get($rootScope.api_url+'/api/dishes/',{
      //headers: {'Authorization': "Token "+$rootScope.currentUser.token}
  });
  menuPromise.success(function(data, status, headers, config){
      $scope.menu = data;
  });
  menuPromise.error(function(data, status, headers, config){
      console.log("Error");
  });

  


  

})




.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})




.controller('ChefCtrl', function($scope, $stateParams, $http, $rootScope) {
  $scope.chef_username = $stateParams.chefUsername;
  $scope.chef_id = $stateParams.chefId;
  $scope.chef = {}
  $scope.endorsements = {}

  var chefPromise = $http.get($rootScope.api_url+'/api/chefs/'+$scope.chef_id,{
      //headers: {'Authorization': "Token "+$rootScope.currentUser.token}
  });
  chefPromise.success(function(data, status, headers, config){
      $scope.chef = data;
  });
  chefPromise.error(function(data, status, headers, config){
      console.log("Error");
  });

  var endorsementsPromise = $http.get($rootScope.api_url+'/api/endorsements?chef_id='+$scope.chef_id,{
      //headers: {'Authorization': "Token "+$rootScope.currentUser.token}
      //headers: {'Authorization': "Token "+$rootScope.currentUser.token}
  });
  endorsementsPromise.success(function(data, status, headers, config){
      $scope.endorsements = data;
  });
  endorsementsPromise.error(function(data, status, headers, config){
      console.log("Error");
  });
});
