 
// // Set-up jQuery event callbacks
// $(document).delegate("div.pull-refresh-page", "pageinit", 
//   function bindPullPagePullCallbacks(event) {
//     $(".iscroll-wrapper", this).bind( {
//       iscroll_onpulldown : onPullDown,
//       iscroll_onpullup   : onPullUp
//     });
//   } );  


// document.addEventListener("deviceready", onDeviceReady, false);

// // PhoneGap is loaded and it is now safe to make calls PhoneGap methods
// function onDeviceReady() {
//     // Register the event listener
//     document.addEventListener("backbutton", onBackKeyDown, false);
// }

// // Handle the back button
// function onBackKeyDown() {
//   console.log("INSIDE BACK BUTTON");
//   navigator.app.exitApp();
// }

$(document).on("mobileinit", onMobileInit);

$(document).on("pageinit", onPageLoad);
//angular.element(document).ready(onMobileInit);

function onMobileInit() {
  //alert("Mobile Init");
  console.log("mobile init");
  //$.mobile.autoInitializePage = false;

  // $.mobile.ajaxEnabled = false;
  // $.mobile.linkBindingEnabled = false;
  // $.mobile.hashListeningEnabled = false;
  // $.mobile.pushStateEnabled = false;
}

function onPageLoad() {// Document.Ready
  //alert("Document Ready");
  console.log("document ready");
  // try {
  //     //alert("token:" + window.localStorage.getItem("auth_accessToken") + ", email: " + window.localStorage.getItem("auth_email"));
  //     if(window.localStorage.getItem("auth_accessToken") != null && 
  //        window.localStorage.getItem("auth_email") != null) {
  //         $.mobile.changePage("#mainpage");
  //     } else {
  //         $.mobile.changePage("#login");
  //     }
  // } catch (exception) {

  // } finally {
  //     //alert("initialise page now!");
  //     //$.mobile.initializePage();
  // }

  // $(".iscroll-wrapper", this).bind( {
  //   iscroll_onpulldown : onPullDown
  // });

  //$('.iscroll-wrapper').on('iscroll_onpulldown', onPullDown);
  //$('.iscroll-wrapper').on('iscroll_onpullup', onPullUpLoadMore);
  $('.iscroll-wrapper').on('iscroll_onscrollmove', infiniteScrolling);
}

// function onPullDown (event, data) { 
//   angular.element($('#iscroll-wrapper')).scope().onPullDown();
// }   

// function onPullUpLoadMore (event, data) {
//   angular.element($('#iscroll-pullup-wrapper')).scope().onPullUpLoadMore();
// }

function infiniteScrolling (event, data) {
  // the y position is negative, so we need to multiple with * -1 //
  var currentY = $(".iscroll-wrapper").iscrollview('y') * (-1);
  // current height - wrapper height //
  var currentHeight = $(".iscroll-wrapper").iscrollview('scrollerH');
  var wrapperHeight = $(".iscroll-wrapper").iscrollview('wrapperH');
  var scrollerHeight = currentHeight - wrapperHeight;

  if((scrollerHeight - 100) < currentY) {
    // if we n px before scroller end execute infinite function //
    angular.element($('#iscroll-wrapper')).scope().loadMoreOlder();
    //infiniteLoadingFunction();
  }
}

/******************************************************************/
//Angular JS stuff - Controllers etc


var jot_get_posts_url = 'http://www.simplyjot.com/simplyjot/index.php/myposts/getallmyposts';
var jot_get_older_posts_url = 'http://www.simplyjot.com/simplyjot/index.php/myposts/getMyPosts';
var jot_delete_post_url = 'http://www.simplyjot.com/simplyjot/index.php/myposts/deletePost';

var jot_create_post_url = 'http://www.simplyjot.com/simplyjot/index.php/myposts/createnewpost';
var jot_login_url = 'http://www.simplyjot.com/simplyjot/index.php/site/externalLoginMobile?provider=';
var jot_login_auth_check_url = "http://www.simplyjot.com/simplyjot/index.php/site/externalLoggedInMobile";
var jot_logout_url = "http://www.simplyjot.com/simplyjot/index.php/site/externalLogoutMobile";

var app = angular.module('jot', ['ngTouch', 'ngRoute', 'ngAnimate']);
//var jot_login_url2 = 'http://www.simplyjot.com/simplyjot/index.php/site/externalLoginMobile?';

app.controller('frontpageCtrl', function ($scope, $rootScope, $window, ResourceService) {

  $scope.checkLogin = function () {
    ResourceService.getResource(jot_login_auth_check_url).then(function(response) {
      alert("response status: " + response.status + ", data: " + response.data);
      if(response.data == 1) {
        $rootScope.$broadcast('getInitPosts');
        $.mobile.changePage("#mainpage", {transition: "slide"});
      }
      else if(response.data == 0) {
        $.mobile.changePage("#login", {transition: "slide"});
      }
      else {
        alert("response: " + response.status + ", " + response.data);
      }
    },
    function(errorResponse) {
      console.log("Post request ERROR with status: " + errorResponse.status + ", data:" + errorResponse.data);
      //alert("Post request ERROR with status: " + errorResponse.status + ", data:" + errorResponse.data);
      var message = "Oops, we couldn't check credentials. Have you checked your connectivity?";
      navigator.notification.alert(message, "", "Error", "Dismiss");    });
  };

  angular.element(document).ready(function () {
    $scope.checkLogin();
  });


  $scope.getWidth = function() {
    return $window.innerWidth;
  };

  $scope.getHeight = function() {
    return $window.innerHeight;
  };

  $scope.setCSSForLogoWidth = function() {
    //alert('width: ' + $scope.windowWidth);

    $('.span-frontpage-logo img').css({
        // Using jQuery CSS we write the $width variable we previously specified as a pixel value. We use max-width incase the image is smaller than our viewport it won't scale it larger. Don't forget to set height to auto or else it will squish your photos.
      'max-width' : $scope.windowWidth/1.5, 
      'height' : 'auto',
      'margin': '0 auto',
      'display': 'block'
    });
  };

  $scope.setCSSForLogoHeight = function() {
    //alert('height: ' + $scope.windowHeight);
    
    $('.div-frontpage-logo').css({
      'margin-top' : $scope.windowHeight/6
    });
  };

  $scope.$watch($scope.getWidth, function(newValue, oldValue) {
    $scope.windowWidth = newValue;
    $scope.setCSSForLogoWidth();
    $scope.setCSSForSpinnerWidth();
  });

  $scope.$watch($scope.getHeight, function(newValue, oldValue) {
    $scope.windowHeight = newValue;
    $scope.setCSSForLogoHeight();
  });

  $window.onresize = function(){
    $scope.$apply();  
  }

});


app.controller('LoginCtrl', function ($scope, $rootScope, $window, $http) {

  $scope.nextPage = function() {
    $.mobile.changePage("#mainpage", {transition: "slide"});
  };

  $scope.loginExternal = function(method) {
    var ref = $window.open(jot_login_url + method, '_blank', 'location=no,clearcache=yes,clearsessioncache=yes');

    ref.addEventListener('loadstop',  function(event){
      var code = '(function(){\n' +
                 '    var foo = document.body.outerText;\n' +
                 '    return foo;\n' +
                 '})()';
      if((event.url).indexOf(jot_login_url + method) != -1) {
        ref.executeScript({code: code}, function(results) {
          ref.close();
          if (results && results.length === 1){
            var data =  JSON.parse(results[0]);
            // alert("result is: " + data);
            // alert("status is: " + data.status);
            // alert("email is: " + data.email);
            if (data.status == "success"){
              $window.localStorage.setItem("user_email", data.email);
              $rootScope.$broadcast('getAllPosts');
              $.mobile.changePage("#mainpage", {transition: "slide"});
            }  
            else if (results.status == "not authenticated") {
              //do something here
            }      
            else {
              console.log("Error: " + results);
            }
            //close the browser
          }
        });
      }
    });
  };

});


app.controller('LogoutCtrl', function ($scope, $http, $window) {
  
  $scope.logout = function() {
    var user_email = $window.localStorage.getItem("user_email");
    var message = "Are you sure you want to log out? User: " + user_email;
    navigator.notification.confirm(message, $scope.logoutCallback, "Logout?", ["OK", "Cancel"]);

  };

  $scope.logoutCallback = function(buttonIndex) {
    alert("logoutCallback called! buttonIndex: " + buttonIndex);

    if(buttonIndex == 1) {
      $http({
        method: 'GET', 
        url: jot_logout_url,
      })
      .then(function(response) {
        console.log("Logging out: " + response.status + ", data: " + response.data);
        alert("Logging out: " + response.status + ", data: " + response.data);
        //$scope.posts = response.data;
        $scope.posts = [];
        $window.localStorage.clear();
        $.mobile.changePage("#login", {transition: "slide", reverse: "true"});
      }, function(errorResponse){
        console.log("Logging out ERROR with status: " + errorResponse.status + ", data:" + errorResonse.data);
        alert("Logging out ERROR with status: " + errorResponse.status + ", data:" + errorResonse.data);
      });
    }
    else if(buttonIndex == 2) {
      // do nothing.
    } 
    else {
      // do nothing.
    }
  };

});


app.controller('ListCtrl', function ($scope, $http, $window, $timeout, ResourceService, socket) {

  $scope.postText = ''; //initialise it to empty string as it is null initially
  $scope.posts = [];
  // $scope.posts = [
  //   {postContent:'This is the first item in the list', id: 0},
  //   {postContent:'New items are inserted to the top of the list', id: 1}];
  //$scope.posts.reverse();  
  $scope.deletePostList = [];
  $scope.requestingPosts = false;

  $scope.requestedAllOlderPosts = false;

  $scope.selectedDeletePost = null;
  $scope.requestingDelete = null;

  $scope.loadMoreText = "loading more...";

  //socket stuff
  socket.on('post', function(data) {
    //alert("NEW1!" + data.post);
    var jsonPost = JSON.parse(data.post);
    alert("NEW POST COMING IN!" + jsonPost.id + ", " + jsonPost.postContent);
    var newPost = new Post();
    newPost.id = jsonPost.id;
    newPost.postContent = jsonPost.postContent;
    newPost.timePosted = jsonPost.timePosted;
    newPost.synced = false;

    $timeout(function () {
      newPost.synced = true;
    }, 1000);

    $scope.posts.reverse();
    $scope.posts.push(newPost);
    $scope.posts.reverse();

    $timeout(function () {
      $("#postlist").listview("refresh");
    }, 1);
  });


  $scope.$on('getInitPosts', function() {
    $scope.init();
    $scope.requestInitOlderPosts();
  });

  $scope.init = function() {
    var email = $window.localStorage.getItem('user_email');
    socket.emit('register', {'email': email});
  };

  $scope.requestInitOlderPosts = function() {
    var initialId = Math.pow(2,32)-1;
    $scope.requestOlderPosts(initialId);
  };

  $scope.requestNextOlderPosts = function() {
    var oldestId = $scope.getOldestIdOfPosts();
    $scope.requestOlderPosts(oldestId);
  };

  $scope.requestOlderPosts = function (oldestId) {
    if(!$scope.requestedAllOlderPosts) {
      //alert('oldest id found is: ' + oldestId);
      $scope.requestingPosts = true;

      var params = {'lastId': oldestId};
      ResourceService.getResource(jot_get_older_posts_url, params)
      .then(function(response){
        console.log("Post with status: " + response.status + ", data: " + response.data);
        alert("Post with status: " + response.status + ", data: " + response.data);

        if (response.data.length == 0) {
          $scope.requestedAllOlderPosts = true;
          $scope.requestingPosts = false;
          $scope.loadMoreText = "End of posts";
        }

        //timeout to simulate network congestion, remove before final
        //$timeout(function () {
          //alert('postid of first: ' + response.data[0].id);
          if($scope.postExists(response.data[0]) == false){
            angular.forEach(response.data, function(jsonPost) {          
              var post = new Post();
              post.id = jsonPost.id;
              post.postContent = jsonPost.postContent;
              post.timePosted = jsonPost.timePosted;
              post.synced = true;
              $scope.posts.push(post); 
            });
          }
          else {
            console.log('Error! Duplicate post!');
          }

          $timeout(function () {
            //alert('refresh');
            $("#postlist").listview("refresh");
            $scope.requestingPosts = false; 
          }, 1);
        //}, 3000);

      }, function(errorResponse){
        console.log("Post request ERROR with status: " + errorResponse.status + ", data:" + errorResonse.data);
        alert("Post request ERROR with status: " + errorResponse.status + ", data:" + errorResonse.data);
        $scope.requestingPosts = false; 
      });
    }
  };

  $scope.postExists = function(selectedPost) {
    var exists = false;
    angular.forEach($scope.posts, function(post) {
      if(selectedPost.id == post.id && 
         selectedPost.postContent == post.postContent) {
        //alert('Post with id: ' + post.id + " and content: '" + post.postContent + "' exists!");
        exists = true;
      }
    });
    //alert('does not exist!');
    return exists;
  };

  $scope.getOldestIdOfPosts = function() {
    var oldestPost = $scope.posts[$scope.posts.length - 1];
    // var oldestId = oldestPost.id;
    // var oldestTimePosted = new Date(oldestPost.timePosted);
    // var postTimePosted;
    // angular.forEach($scope.posts, function(post)) {
    //   postTimePosted = new Date(post.timePosted);
    //   if(postTimePosted < oldestTimePosted) {
    //     oldestId = post.id;
    //     oldestTimePosted = postTimePosted;
    //   }
    // }
    return oldestPost.id;
  };

  $scope.addPost = function() {
    if($scope.postText != ''){
      var newPost = new Post();
      newPost.postContent = $scope.postText;
      newPost.synced = false;

      $scope.posts.reverse();
      $scope.posts.push(newPost);
      $scope.posts.reverse();

      var xsrf = {'Post[postContent]': $scope.postText,
                  'Post[postType]': 1,
                  'Post[mySocketId]' : socket.sessionid()};

      ResourceService.postResource(jot_create_post_url, xsrf)
      .then(function(response) {
        console.log("Post with status: " + response.status + ", data: " + response.data);
 
        alert("Post with status: " + response.status + ", data: " + response.data);

        var postJsonObject = response.data;
        newPost.id = postJsonObject.id;
        newPost.timePosted = postJsonObject.timePosted;
        $timeout(function () {
          newPost.synced = true;
        }, 1000);
      }, function(errorResponse){
        console.log("Post request ERROR with status: " + errorResponse.status + ", data: " + errorResponse.data);
       
        alert("Post request ERROR with status: " + errorResponse.status + ", data: " + errorResponse.data);
        //put a notification alert here.
      });

      $scope.postText = '';
      $timeout(function () {
        $("#postlist").listview("refresh"); 
      }, 1);
    }
  };
 
  $scope.count = function() {
    var count = 0;
    angular.forEach($scope.posts, function(post) {
      count += 1;
    });
    return count;
  };

  $scope.isUserEmailSet = function() {
    return $window.localStorage.getItem("user_email") != null;
  };

  $scope.userEmail = function() {
    return $window.localStorage.getItem("user_email");
  };


  //Copy text to system-wide clipboard
  $scope.copyToClipboard = function(post) {
    $window.clipboardManagerCopy(
      post.postContent,
      function(r){
        var message = "'" + post.postContent + "'" + " copied to clipboard";
        navigator.notification.alert(message, "", "Copied", "OK");
      },
      function(e){
        var message = "Cannot be copied to clipboard";
        navigator.notification.alert(message, "", "Error", "Dismiss");
      }
    );
  };


  $scope.requestDeletePost = function(post) {
    $scope.selectedDeletePost = null;
    $scope.requestingDelete = post;
    var xsrf = {'Post[id]': post.id};
    ResourceService.postResource(jot_delete_post_url, xsrf)
    .then(function(response) {
      console.log("Deleted post with status: " + response.status + ", data: " + response.data);
      //alert("Deleted post with status: " + response.status + ", data: " + response.data);
      $scope.requestingDelete = null;
      $scope.deletePost(post);
    }, function(errorResponse){
      console.log("Post request ERROR with status: " + errorResponse.status + ", data: " + errorResponse.data);
      //alert("Post request ERROR with status: " + errorResponse.status + ", data: " + errorResponse.data);
      $scope.requestingDelete = null;
      var message = "Oops, we couldn't delete your post. Have you checked your connectivity?";
      navigator.notification.alert(message, "", "Error", "Dismiss");
    });

  };

  //Delete Stuff
  $scope.setDelete = function(post) {
    $scope.selectedDeletePost = post;
  };

  $scope.unsetDelete = function(postToDelete) {
    $scope.selectedDeletePost = null;
  };

  $scope.isSwipeDelete = function(post) {
    if($scope.selectedDeletePost == null){
      return false;
    }
    else{
      return post.id == $scope.selectedDeletePost.id;
    }
  };
 
  $scope.deletePost = function(selected_post) {
    var index = 0;
    angular.forEach($scope.posts, function(post) {
      if(post.id == selected_post.id){
        $scope.posts.splice(index, 1);
        $scope.removeFromDeleteList(selected_post);
        //$scope.$apply();
        $("#postlist").listview("refresh");
        $(".iscroll-wrapper").iscrollview("refresh");
      }
      index = index + 1;
    });  
  };

  $scope.isRequestingDelete = function(post) {
    if($scope.requestingDelete == null){
      return false;
    }
    else{
      return post.id == $scope.requestingDelete.id;
    }
  };


  //Called from outside of scope, not a good practice
  // $scope.onPullDown = function () {
  //   alert("angular js scope - pulled down!");
  //   $scope.requestPosts();
  //   $(".iscroll-wrapper").iscrollview("refresh");
  // };


  // $scope.onPullUpLoadMore = function() {
  //   alert("angular js scope - pulled up!");
  //   $scope.requestNextOlderPosts();
  //   $(".iscroll-wrapper").iscrollview("refresh");
  // };

  $scope.loadMoreOlder = function() {
    if(!$scope.requestingPosts && !$scope.requestedAllOlderPosts){
      alert('infinite scroll!');
      $scope.requestNextOlderPosts();
      $(".iscroll-wrapper").iscrollview("refresh");
    }
  };

});


app.factory('socket', function ($rootScope) {
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


//Directive using Hammer.js for tap-hold
app.directive('onHold', function () {
    return function (scope, element, attrs) {
      return $(element).hammer({
        hold_timeout: 600,
        prevent_default: false,
        drag_vertical: false
      })
      .bind("hold", function (ev) {
        return scope.$apply(attrs['onHold']);
      });
    };
 });

//Directive for spin.js for loading spinner
app.directive('usSpinner', ['$window', function ($window) {
  return {
    scope: true,
    link: function (scope, element, attr) {
      scope.spinner = null;
      
      function stopSpinner() {
        if (scope.spinner) {
          scope.spinner.stop();
          scope.spinner = null;
        }
      }
      
      //scope.$watch(attr.usSpinner, function (options) {
        var options = {
          lines: 11, // The number of lines to draw
          length: 10, // The length of each line
          width: 2, // The line thickness
          radius: 10, // The radius of the inner circle
          corners: 0.5, // Corner roundness (0..1)
          rotate: 0, // The rotation offset
          direction: 1, // 1: clockwise, -1: counterclockwise
          color: '#000', // #rgb or #rrggbb or array of colors
          speed: 1.4, // Rounds per second
          trail: 45, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: 'auto', // Top position relative to parent in px
          left: 'auto' // Left position relative to parent in px
        };

        stopSpinner();
        scope.spinner = new $window.Spinner(options);
        scope.spinner.spin(element[0]);
      //}, true);
      
      scope.$on('$destroy', function () {
        stopSpinner();
      });
    }
  };
}]);

app.directive('jqueryMobileTpl', function () {
    return {
        link: function (scope, elm, attr) {
            elm.listview('refresh');
        }
    };
});
app.directive('repeatDone', function () {
    return function (scope, element, attrs) {
        // When the last element is rendered
        if (scope.$last) { 
            element.parent().parent().listview('refresh');
        }
    }
});


app.service('ResourceService', function ($http, $q) {
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


  // this.postResource = function
});


app.filter('orderPostsByTimePosted', function(){
 return function(input) {
    if (!angular.isObject(input)) return input;

    var array = [];
    for(var objectKey in input) {
        array.push(input[objectKey]);
    }

    array.sort(function(a, b){
        aDate = new Date(a.timePosted);
        bDate = new Date(b.timePosted);
        return aDate>bDate ? -1 : aDate<bDate ? 1 : 0;
    });
    return array;
 }
});

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

function Post() {
  var id;
  var postContent;
  var timePosted;
  var synced = false;
  var equals = function(other) {
    return other.id === this.id && 
           other.postContent === this.postContent &&
           other.timePosted === this.timePosted;
  };
}
