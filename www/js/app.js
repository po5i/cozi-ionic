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
angular.module('starter', ['ionic', 'starter.controllers', 'ngCart', 'oauthApp.services', 'LocalStorageModule',])

.run(function($ionicPlatform, localStorageService, $rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if(typeof window.OAuth !== 'undefined'){
      //alert(window.OAuth.getVersion());
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

    
  });

  /*
  var currentUser = localStorageService.get('currentUser');
  if(currentUser){
    $rootScope.currentUser = currentUser;
  }
  */

})

.config(function($stateProvider, $urlRouterProvider, localStorageServiceProvider) {

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
    views: {
      'menuContent': {
        templateUrl: 'templates/request.html'
      }
    }
  })

  .state('app.request2', {
    url: '/request2',
    views: {
      'menuContent': {
        templateUrl: 'templates/request2.html'
      }
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
      views: {
        'menuContent': {
          templateUrl: 'templates/history.html'
        }
      }
    })
  .state('app.profile', {
      url: '/profile',
      views: {
        'menuContent': {
          templateUrl: 'templates/profile.html'
        }
      }
    })
  .state('app.rate', {
      url: '/rate',
      views: {
        'menuContent': {
          templateUrl: 'templates/rate.html'
        }
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