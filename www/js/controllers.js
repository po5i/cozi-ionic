angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $state, ngCart, $http, $stateParams, oauthService, $ionicHistory) {

  oauthService.initialize();

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $rootScope.api_url = "http://api.cozifood.com";
  $scope.user = null;

  ngCart.setTaxRate(7.5);
  ngCart.setShipping(2.99);  

  // Form data for the login modal
  $scope.loginData = {};
  $scope.registerToogle = false;
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
    /*if (!$rootScope.authenticated) {
      //event.preventDefault();
      // get me a login!
      $scope.modal.show();
    }
    else{
      $state.go('app.request2');  
    }*/
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

    //vaciar el carrito
    for (var i in items) {
      ngCart.removeItem(i);
    }
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

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.logout = function() {
    oauthService.clearCache();
    delete $scope.user;
    $ionicHistory.clearHistory();
    $state.go("app.request");
  };


  // detectar requireLogin
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    if(("data" in toState)){
      //console.log(toState);
      var requireLogin = toState.data.requireLogin;

      if (requireLogin && (typeof $rootScope.auth_data === 'undefined')) {
        event.preventDefault();
        $rootScope.redirect = toState.name;
        // get me a login!
        $scope.modal.show();
      }
    }
  });

  

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    promiseB = oauthService.authenticate($scope.loginData).then(function(data) {
      
    });

    promiseB.then(function(data){
        if ($rootScope.authenticated) {
          $scope.error = false;    
          $scope.loginData = {};
          
          //get the user information
          oauthService.getCurrentUser().then(function(data2){
            $scope.user = data2;
          });
          $scope.modal.hide();
          if($rootScope.redirect != null){
            $state.go($rootScope.redirect);  
            $rootScope.redirect = null;
          }
          
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
      promiseB = oauthService.connectProvider(backend).then(function(data) {
      });

      promiseB.then(function(data){
        oauthService.getCurrentUser().then(function(data){
          $scope.user = data;
        });  
        $scope.modal.hide();
        if($rootScope.redirect != null){
          $state.go($rootScope.redirect);  
          $rootScope.redirect = null;
        }
      });
  };

  $scope.showRegister = function() {
      $scope.registerToogle = true;
  };

  $scope.registerData = {};
  $scope.register = function() {
      //send it to the api:
      var newPromise = $http.post($rootScope.api_url+'/api/users/',$scope.registerData);

      newPromise.success(function(data, status, headers, config){
          alert('Nuevo usuario registrado, por favor ingrese con sus credenciales');
          $scope.registerData = {};
      });

      newPromise.error(function(data, status, headers, config){
          if(status==400){
              alert("No es posible registrarse, probablemente el usuario ya existe.");
          }
          else{
              alert("Ha ocurrido un error "+status);
          }
      });

      $scope.registerToogle = false;
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

  


  $scope.showDescription = function(index){
    $scope.menu[index].show_flag = 'description'
  };

  $scope.showChef = function(index){
    $scope.menu[index].show_flag = 'chef'
  };
  

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
    $scope.user = null;

    //if(typeof $rootScope.auth_data !== 'undefined'){
    if ($rootScope.authenticated) {
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

    //if(typeof $rootScope.auth_data !== 'undefined'){
    if ($rootScope.authenticated) {
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
  $scope.chef = {};
  $scope.endorsements = {};

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
})





.controller('ChefAdminCtrl', function($scope, $stateParams, $http, $rootScope, $ionicModal, Upload, $timeout) {
  //CHEFS
  /////////////////////
  $scope.chef_id = $rootScope.chef_id;
  $scope.chef = {};
  $scope.pending = {};
  $scope.dish = {};
  $scope.dish_form_mode = null;

  $ionicModal.fromTemplateUrl('templates/dish_form.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  var chefPromise = $http.get($rootScope.api_url+'/api/chefs/'+$scope.chef_id,{
      //headers: {'Authorization': "Token "+$rootScope.auth_data.token}
  });
  chefPromise.success(function(data, status, headers, config){
      $scope.chef = data;
  });
  chefPromise.error(function(data, status, headers, config){
      console.log("Error");
  });

  var pendingPromise = $http.get($rootScope.api_url+'/api/history/?chef_id=' + $scope.chef_id,{
      headers: {'Authorization': "Token "+$rootScope.auth_data.token}
  });
  pendingPromise.success(function(data, status, headers, config){
      $scope.pending = data;
  });
  pendingPromise.error(function(data, status, headers, config){
      console.log("Error");
  });

  var dishesPromise = $http.get($rootScope.api_url+'/api/dishadmin/?chef_id=' + $scope.chef_id,{
      headers: {'Authorization': "Token "+$rootScope.auth_data.token}
  });
  dishesPromise.success(function(data, status, headers, config){
      $scope.dishes = data;
  });
  dishesPromise.error(function(data, status, headers, config){
      console.log("Error");
  });

  $scope.changeRequestStatus = function(request_id,request_status,model_index) {
      var newPromise = $http.patch($rootScope.api_url+'/api/requests/'+ request_id + '/',{
                                                                          id: request_id,
                                                                          status: request_status
      },{
          headers: {'Authorization': "Token "+$rootScope.auth_data.token}
      });
      newPromise.success(function(data, status, headers, config){
        $scope.pending[model_index].status = request_status;
        alert("Estado cambiado");
        //cambiar el model
      });
      newPromise.error(function(data, status, headers, config){      });
  };

  $scope.edit = function(dish,index) {
    console.log(index);
    $scope.dish_form_mode = index;
    $scope.dish = dish;
    $scope.modal.show()
  }

  $scope.new = function() {
    $scope.dish_form_mode = 'new';
    $scope.dish = {};
    $scope.modal.show()
  }

  $scope.save = function(file) {
    //TODO: revisar
    //http://forum.ionicframework.com/t/how-to-make-uploading-files-or-images-using-ionicframwork-or-angularjs/391/18
    //https://github.com/leon/angular-upload  

    


    if($scope.dish_form_mode == 'new'){
      var obj = {
                  chef: $scope.chef_id,
                  name: $scope.dish.name,
                  tags: $scope.dish.tags,
                  description: $scope.dish.description,
                  price: $scope.dish.price,
                  published: $scope.dish.published,
      }
      /*var newPromise = $http.post($rootScope.api_url+'/api/dishadmin/',obj,{
          headers: {'Authorization': "Token "+$rootScope.auth_data.token}
      });
      newPromise.success(function(data, status, headers, config){
        $scope.dishes.push($scope.dish);
        $scope.dish = null;     
      });
      newPromise.error(function(data, status, headers, config){      });*/

      //https://github.com/danialfarid/ng-file-upload
      file.upload = Upload.upload({
        url: $rootScope.api_url+'/api/dishadmin/',
        method: 'POST',
        headers: {'Authorization': "Token "+$rootScope.auth_data.token},
        fields: obj,
        file: file,
        fileFormDataName: 'myFile'
      });

      file.upload.then(function (response) {
        $timeout(function () {
          //file.result = response.data;
          $scope.dishes.push(response.data);
          $scope.dish = null;     
        });
      }, function (response) {
        //if (response.status > 0)
          //$scope.errorMsg = response.status + ': ' + response.data;
      });

      file.upload.progress(function (evt) {
        // Math.min is to fix IE which reports 200% sometimes
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    }
    else if($scope.dish_form_mode >= 0){
      var obj = {
                  name: $scope.dish.name,
                  tags: $scope.dish.tags,
                  description: $scope.dish.description,
                  price: $scope.dish.price,
                  published: $scope.dish.published,
      }
      /*var newPromise = $http.patch($rootScope.api_url+'/api/dishadmin/' + $scope.dish.id + '/',obj,{
          headers: {'Authorization': "Token "+$rootScope.auth_data.token}
      });
      newPromise.success(function(data, status, headers, config){
        $scope.dishes[$scope.dish_form_mode] = $scope.dish;
        $scope.dish = null;
      });
      newPromise.error(function(data, status, headers, config){      });*/

      //https://github.com/danialfarid/ng-file-upload
      file.upload = Upload.upload({
        url: $rootScope.api_url+'/api/dishadmin/' + $scope.dish.id + '/',
        method: 'PATCH',
        headers: {'Authorization': "Token "+$rootScope.auth_data.token},
        fields: obj,
        file: file,
        fileFormDataName: 'myFile'
      });

      file.upload.then(function (response) {
        $timeout(function () {
          //file.result = response.data;
          $scope.dishes[$scope.dish_form_mode] = $scope.dish;
          $scope.dish = null;     
        });
      }, function (response) {
        //if (response.status > 0)
          //$scope.errorMsg = response.status + ': ' + response.data;
      });

      file.upload.progress(function (evt) {
        // Math.min is to fix IE which reports 200% sometimes
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
      
    }
    $scope.modal.hide();
  };

  $scope.close = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

});