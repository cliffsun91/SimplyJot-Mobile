var appServices = angular.module('app.services', []);

appServices.factory('socket', function ($rootScope) {
  var socket = io.connect('http://184.95.43.56:8081/');
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
    sessionid: function () {
      return socket.socket['sessionid'];
    }
  };
});


appServices.service('ResourceService', function ($http, $q) {
  this.getResource = function(getUrl, getParams) {
    getParams = (typeof getParams === "undefined") ? {} : getParams;
    var deferred = $q.defer();
    $http({
      method: 'GET', 
      url: getUrl,
      params: getParams
    })
    .then(function(response) {
      deferred.resolve(response);
    }, 
    function(errorResponse) {
      deferred.reject(errorResponse);
    });

    return deferred.promise;
  };

  this.postResource = function(postUrl, postxsrfData) {
    postxsrfData = (typeof postxsrfData === "undefined") ? {} : postxsrfData;
    var deferred = $q.defer();
    $http({
      method: 'POST', 
      url: postUrl,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      data: postxsrfData
    })
    .then(function(response) {
      deferred.resolve(response);
    }, 
    function(errorResponse) {
      deferred.reject(errorResponse);
    });

    return deferred.promise;
  };

});
