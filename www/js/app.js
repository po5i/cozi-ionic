// Ionic Starter App

//OAUTH.IO
//public
//kH8PJiGff3uvzSvnxPfbyKotKEg
//secret
//hUCUwAFJ_fUtmyyPH5PDAxUmcL0

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCart', 'oauthApp.services', 'LocalStorageModule', 'ionic.rating', 'ngFileUpload','ngAnimate', 'Alertify'])

.run(function($ionicPlatform, localStorageService, $rootScope, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      //StatusBar.styleDefault();
      StatusBar.statusBarOverlaysWebView = false;
      StatusBar.backgroundColorByHexString("#D66B22");
    }

    if(typeof window.OAuth !== 'undefined'){
      $rootScope.OAuth = window.OAuth;
      $rootScope.OAuth.initialize('kH8PJiGff3uvzSvnxPfbyKotKEg');
      var storage_backend = localStorageService.get('backend');
      if(storage_backend)
          authorizationResult = $rootScope.OAuth.create(storage_backend);
    }
    else{
      //console.log("not mobile");
      $.getScript( "lib/oauth.js", function() {
        $rootScope.OAuth = OAuth;        
        $rootScope.OAuth.initialize('kH8PJiGff3uvzSvnxPfbyKotKEg');
        var storage_backend = localStorageService.get('backend');
        if(storage_backend)
            authorizationResult = $rootScope.OAuth.create(storage_backend);
      });
    }

    $rootScope.authenticated = false;
    $rootScope.redirect = null;

    // persistent session
    var currentUser = localStorageService.get('currentUser');
    if(currentUser){
      //console.log(currentUser);
      $rootScope.auth_data = currentUser;
      $rootScope.authenticated = true;
    }
  });

  //loading
  $rootScope.$on('loading:show', function() {
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
  });

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide();
  });

  
  
  

})

.config(function($stateProvider, $urlRouterProvider, localStorageServiceProvider, $httpProvider) {

  // loading

  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:show');
        return config;
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide');
        return response;
      }
    }
  });

  // routing
  
  localStorageServiceProvider.prefix = 'cozi';

  $stateProvider

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.request', {
      url: '/request',
      cache: false, 
      views: {
        'menuContent': {
          templateUrl: 'templates/request.html'
        }
      }
    })

    .state('app.request2', {
      url: '/request2',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/request2.html'
        }
      },
      data: {
        requireLogin: true
      }
    })

    .state('app.subscribe', {
        url: '/subscribe',
        views: {
          'menuContent': {
            templateUrl: 'templates/subscribe.html'
          }
        }
      })

    .state('app.history', {
        url: '/history',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/history.html',
            controller: 'HistoryCtrl'
          }
        },
        data: {
          requireLogin: true
        }
      })
    .state('app.profile', {
        url: '/profile',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/profile.html',
            controller: 'ProfileCtrl'
          }
        },
        data: {
          requireLogin: true
        }
      })

    .state('app.pending', {
        url: '/pending',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/pending.html',
            controller: 'ChefAdminCtrl'
          }
        },
        data: {
          requireLogin: true
        }
      })

    .state('app.dishmanager', {
        url: '/dishmanager',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/dishmanager.html',
            controller: 'ChefAdminCtrl'
          }
        },
        data: {
          requireLogin: true
        }
      })

    .state('app.rate', {
        url: '/rate',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/rate.html'
          }
        },
        data: {
          requireLogin: true
        }
      })

    .state('app.chefs', {
        url: '/chefs',
        views: {
          'menuContent': {
            templateUrl: 'templates/chefs.html',
            controller: 'PlaylistsCtrl'
          }
        }
      })

    .state('app.chef', {
      url: '/chefs/:chefUsername/:chefId',
      views: {
        'menuContent': {
          templateUrl: 'templates/chef.html',
          controller: 'ChefCtrl'
        }
      }
    });
  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/request');
});
