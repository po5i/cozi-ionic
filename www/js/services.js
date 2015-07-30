angular.module('oauthApp.services', []).factory('oauthService', function($q, $http, $rootScope, $state, localStorageService) {

    var authorizationResult = false;

    return {
        initialize: function() {
            //initialize OAuth.io with public key of the application
            //$rootScope.OAuth.initialize('BKgnpXxkgDUCmN_pi7o-8paHztg');   //ahora es en ionic platform ready
            //try to create an authorization result when the page loads, this means a returning user won't have to click the twitter button again
            
            
        },
        isReady: function() {
            return (authorizationResult);
        },
        authenticate: function(credentials, callback) {
            var backend = "auth";
            $http.post($rootScope.api_url+'/api-token/login/' + backend + '/', credentials ).success(function(data,status) {
                if(status > 400){
                    $rootScope.authenticated = false;
                }
                else{
                    if (data.token) {
                        $rootScope.authenticated = true;
                        $rootScope.currentUser = data;       
                        localStorageService.set('currentUser',data);
                        localStorageService.set('backend',backend);
                    } else {
                        $rootScope.authenticated = false;
                    }
                    callback && callback();
                }                
            }).error(function() {
                $rootScope.authenticated = false;
                callback && callback();
            });
        },
        connectProvider: function(backend) {
            var deferred = $q.defer();
            
            $rootScope.OAuth.popup(backend)
            .done(function(result) { //cache means to execute the callback if the tokens are already present
                
                    authorizationResult = result;
                    console.log(result);
                    var token;

                    //django
                    if(backend=="facebook")
                        token = "OAuthToken "+result.access_token;
                    if(backend=="twitter")
                        token = "OAuthToken "+result.oauth_token+" "+result.oauth_token_secret;

                    /*console.log("consulting me...");
                    result.me().done(function(me) {
                      alert('Hello ' + me.name);
                    }).fail(function(err) {
                      //todo when the OAuth flow failed
                    });*/

                    
                    $http.defaults.useXDomain = true;
                    var loginPromise = $http.post($rootScope.api_url+'/api-token/login/' + backend + '/',"",{
                        headers: {'Authorization': token}
                    });

                    loginPromise.success(function(data, status, headers, config){
                        if(status > 400){
                            alert("Ha ocurrido un error "+status);
                        }
                        else{
                            //console.log("login success");
                            //console.log(data);
                            deferred.resolve(data);

                            if(data.username){
                                $rootScope.currentUser = data;
                                $rootScope.authenticated = true;
                                localStorageService.set('currentUser',data);
                                localStorageService.set('backend',backend);
                            }
                            else{
                                authorizationResult = false;
                            }
                        }   
                    });
                    loginPromise.error(function(data, status, headers, config){
                        console.error("Ha ocurrido un error");
                        console.error(data);
                        authorizationResult = false;
                        deferred.resolve(data);
                    });

                    //deferred.resolve();
            })
            .fail(function (err) {
              //handle error with err
              alert("Ha ocurrido un error: "+err);
            });
            return deferred.promise;
        },
        connectNewProvider: function(backend) {
            var deferred = $q.defer();
            
            $rootScope.OAuth.popup(backend)

            .done(function(result) { //cache means to execute the callback if the tokens are already present
                    authorizationResult = result;
                    console.log(result);

                    var token;

                    //django
                    if(backend=="facebook")
                        token = "OAuthToken "+result.access_token;
                    if(backend=="twitter")
                        token = "OAuthToken "+result.oauth_token+" "+result.oauth_token_secret;

                    
                    $http.defaults.useXDomain = true;
                    var loginPromise = $http.post($rootScope.api_url+'/api-token/connect/' + backend + '/',{authorization: token,user:$rootScope.currentUser.id},{
                        headers: {'Authorization': "Token "+$rootScope.currentUser.token}
                    });


                    loginPromise.success(function(data, status, headers, config){
                        if(status > 400){
                            alert("Ha ocurrido un error "+status);
                        }
                        else{
                            alert("Se ha conectado su cuenta social");
                            console.log(data);
                            deferred.resolve(data);
                        }
                    });
                    loginPromise.error(function(data, status, headers, config){
                        console.error("Ha ocurrido un error");
                        console.error(data);
                        deferred.resolve(data);
                    });

                    //deferred.resolve();
            })
            .fail(function (err) {
              //handle error with err
              alert("Ha ocurrido un error: "+err);
            });
            return deferred.promise;
        },
        /*getLatestTweets: function () {
            //create a deferred object using Angular's $q service
            var deferred = $q.defer();
            var promise = authorizationResult.get('/1.1/statuses/home_timeline.json').done(function(data) { //https://dev.twitter.com/docs/api/1.1/get/statuses/home_timeline
                //when the data is retrieved resolved the deferred object
                deferred.resolve(data)
            });
            //return the promise of the deferred object
            return deferred.promise;
        },*/
        clearCache: function() {
            $rootScope.authenticated = false;
            if(typeof $rootScope.currentUser !== 'undefined'){
                var loginPromise = $http.get($rootScope.api_url+'/api-token/logout/',{                        
                    headers: {'Authorization': "Token "+$rootScope.currentUser.token}
                });

                loginPromise.success(function(data, status, headers, config){
                    if(status > 400){
                        alert("Ha ocurrido un error "+status);
                    }
                    else{
                        //OAuth.clearCache();
                        authorizationResult = false;
                        
                        delete $rootScope.currentUser;
                        delete $rootScope.authenticated;
                        localStorageService.clearAll();
                        
                    }  
                });
                loginPromise.error(function(data, status, headers, config){
                    console.error("Ha ocurrido un error");
                    console.error(data);
                });
            }
        },

        /*getUser: function() {
            if($rootScope.currentUser){
                var loginPromise = $http.get($rootScope.api_url+'/api-token/user/',{                        
                    headers: {'Authorization': "Token "+$rootScope.currentUser.token}
                });

                loginPromise.success(function(data, status, headers, config){
                    console.log("user success");
                    console.log(data);
                })
                loginPromise.error(function(data, status, headers, config){
                    console.error("user error");
                    console.error(data);
                });
            }
            else{
                console.warn("not user session");
            } 
        }*/
    };
    
});

