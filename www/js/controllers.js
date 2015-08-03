angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $state, ngCart, $http, $stateParams, oauthService) {

  oauthService.initialize();

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $rootScope.api_url = "http://162.243.230.228";
  $scope.user = {};

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

  //RATE
  /////////////////////

  
  $scope.review = function (request_id,chef_id,dish_id) {
      $scope.review_new = {};
      $scope.review_new.dish_rate = 3;
      $scope.review_new.chef_rate = 3;
      $scope.review_new.max = 5;

      $scope.review_new.request_id = request_id;
      $scope.review_new.chef_id = chef_id;
      $scope.review_new.dish_id = dish_id;
      $state.go('app.rate');
  };

  $scope.doReview = function () {
      //save reviews
      if(typeof $scope.review_new.chef_review !== 'undefined'){
        var newPromise = $http.post($rootScope.api_url+'/api/chefendorsements/',{
                                                                              chef: $scope.review_new.chef_id,
                                                                              user: $rootScope.auth_data.id,
                                                                              endorsement: $scope.review_new.chef_review
        },{
            headers: {'Authorization': "Token "+$rootScope.auth_data.token}
        });
        newPromise.success(function(data, status, headers, config){      });
        newPromise.error(function(data, status, headers, config){      });
      }
        
      var newPromise = $http.post($rootScope.api_url+'/api/chefratings/',{
                                                                            chef: $scope.review_new.chef_id,
                                                                            user: $rootScope.auth_data.id,
                                                                            rating: $scope.review_new.chef_rate
      },{
          headers: {'Authorization': "Token "+$rootScope.auth_data.token}
      });
      newPromise.success(function(data, status, headers, config){      });
      newPromise.error(function(data, status, headers, config){      });

      var newPromise = $http.post($rootScope.api_url+'/api/dishratings/',{
                                                                            dish: $scope.review_new.dish_id,
                                                                            user: $rootScope.auth_data.id,
                                                                            rating: $scope.review_new.dish_rate,
                                                                            review: $scope.review_new.dish_review
      },{
          headers: {'Authorization': "Token "+$rootScope.auth_data.token}
      });
      newPromise.success(function(data, status, headers, config){      });
      newPromise.error(function(data, status, headers, config){      });

      var newPromise = $http.patch($rootScope.api_url+'/api/requests/'+$scope.review_new.request_id + '/',{
                                                                          id: $scope.review_new.request_id,
                                                                          reviewed: true
      },{
          headers: {'Authorization': "Token "+$rootScope.auth_data.token}
      });
      newPromise.success(function(data, status, headers, config){      });
      newPromise.error(function(data, status, headers, config){      });

      console.log("Calificación guardada");
      $state.go('app.request');
  }

  /*$scope.$watch('review_new.dish_rate', function() {
    console.log('New value: '+$scope.review_new.dish_rate);
  });  */


  //CHECKOUT
  /////////////////////

  $scope.checkout = function() {
    //check if authentication
    if ((typeof $rootScope.auth_data === 'undefined')) {
      //event.preventDefault();
      // get me a login!
      $scope.modal.show();
    }
    $state.go('app.request2');
  }

  $scope.rq = {}
  $scope.doCheckout = function() {
    //guardar el request, por cada plato
    var items = ngCart.getItems();
    var total = ngCart.totalCost();
    for (var i in items) {
      var req = {};

      req.user = $rootScope.auth_data.id;
      req.dish = items[i].getId();
      req.type = $scope.rq.type;
      req.servings = items[i].getQuantity();
      req.date = $scope.rq.date;
      req.address = $scope.user.profile.address;
      req.phone = $scope.user.profile.phone;
      req.dont_eat = $scope.user.profile.dont_eat;
      req.concerns = $scope.user.profile.concerns;
      req.allergies = $scope.user.profile.allergies;
      req.price = items[i].getPrice();
      req.status = "solicitado";

      console.log(req);
      console.log(items[i].getTotal());

      var newPromise = $http.post($rootScope.api_url+'/api/requests/',req,{
          headers: {'Authorization': "Token "+$rootScope.auth_data.token}
      });

      newPromise.success(function(data, status, headers, config){
          alert("Solicitud enviada");
      });

      newPromise.error(function(data, status, headers, config){
          alert("Ha ocurrido un error "+status);
      });
    }

    //TODO: vaciar el carrito
  }



  //AUTH
  /////////////////////

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // detectar requireLogin
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    if(("data" in toState)){
      var requireLogin = toState.data.requireLogin;

      if (requireLogin && (typeof $rootScope.auth_data === 'undefined')) {
        event.preventDefault();
        // get me a login!
        $scope.modal.show();
      }
    }
  });

  

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    oauthService.authenticate($scope.loginData).then(function(data) {
      if ($rootScope.authenticated) {
          $scope.error = false;    
          $scope.loginData = {};
          
          //get the user information
          oauthService.getCurrentUser().then(function(data2){
            $scope.user = data2;
          });  

          $scope.modal.hide();
      } else {
          $scope.error = true;
          alert("Ha ocurrido un error al ingresar con su cuenta");
      }
    });

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    //$timeout(function() {
    //  $scope.closeLogin();
    //}, 1000);
  };

  //when the user clicks the connect twitter button, the popup authorization window opens
  $scope.connectButton = function(backend) {
      oauthService.connectProvider(backend).then(function(data) {
          if (oauthService.isReady()) {
              //$scope.username = data.username;
              //if the authorization is successful, hide the connect button and display the tweets
          }
          else{
              //$scope.error = true;
          }

          //get the user information
          oauthService.getCurrentUser().then(function(data){
            $scope.user = data;
          });  
          $scope.modal.hide();
      });
  };

  //sign out clears the OAuth cache, the user will have to reauthenticate when returning
  //deprecated
  $scope.signOut = function() {
      oauthService.clearCache();
      delete $scope.user;
  };

  //MENU
  /////////////////////

  $scope.filters = { };

  var menuPromise = $http.get($rootScope.api_url+'/api/dishes/',{
      //headers: {'Authorization': "Token "+$rootScope.auth_data.token}
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




.controller('ProfileCtrl', function($scope, $stateParams, $http, $rootScope, $state, oauthService) {
    //PROFILE
    ////////////////////
    $scope.user = {};

    if(typeof $rootScope.auth_data !== 'undefined'){
        //get the user information
        oauthService.getCurrentUser().then(function(data){
          $scope.user = data;
        });
    }
    else{
      console.log("Inicie sesión");
      $state.go('app.request');
    }

    $scope.updateProfile = function(){
        var userPromise = $http.put($rootScope.api_url+'/api/users/' + $rootScope.auth_data.id + '/',$scope.user,{
            headers: {'Authorization': "Token "+$rootScope.auth_data.token}
        });

        userPromise.success(function(data, status, headers, config){
            alert('Cambios guardados');
        });

        userPromise.error(function(data, status, headers, config){
            alert("Ha ocurrido un error "+status);
        });
    };
})




.controller('HistoryCtrl', function($scope, $stateParams, $http, $rootScope, $state, oauthService) {
    //PROFILE
    ////////////////////
    $scope.history = {};

    if(typeof $rootScope.auth_data !== 'undefined'){
        //get the user information
        oauthService.getUserHistory().then(function(data){
          $scope.history = data;
        });
    }
    else{
      console.log("Inicie sesión");
      $state.go('app.request');
    }
})




.controller('ChefCtrl', function($scope, $stateParams, $http, $rootScope) {
  //CHEFS
  /////////////////////
  $scope.chef_username = $stateParams.chefUsername;
  $scope.chef_id = $stateParams.chefId;
  $scope.chef = {}
  $scope.endorsements = {}

  var chefPromise = $http.get($rootScope.api_url+'/api/chefs/'+$scope.chef_id,{
      //headers: {'Authorization': "Token "+$rootScope.auth_data.token}
  });
  chefPromise.success(function(data, status, headers, config){
      $scope.chef = data;
  });
  chefPromise.error(function(data, status, headers, config){
      console.log("Error");
  });

  var endorsementsPromise = $http.get($rootScope.api_url+'/api/endorsements?chef_id='+$scope.chef_id,{
      //headers: {'Authorization': "Token "+$rootScope.auth_data.token}
  });
  endorsementsPromise.success(function(data, status, headers, config){
      $scope.endorsements = data;
  });
  endorsementsPromise.error(function(data, status, headers, config){
      console.log("Error");
  });
});
