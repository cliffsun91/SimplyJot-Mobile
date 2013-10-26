// $(document).ready(function() {
//   // Set the variable $width to the width of our wrapper on page load
//   var width = $(document).width();
//   //width = 200;
//   alert('width: ' + width);
//   // Target all images inside the #content. This works best if you want to ignore certain images that are part of the layout design
//   $('.span-frontpage-logo img').css({
//       // Using jQuery CSS we write the $width variable we previously specified as a pixel value. We use max-width incase the image is smaller than our viewport it won't scale it larger. Don't forget to set height to auto or else it will squish your photos.
//     'max-width' : width/5, 
//     'height' : 'auto',
//     'margin': '0 auto',
//     'display': 'block'
//   });
// });

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
}


/******************************************************************/
//Angular JS stuff - Controllers etc


//testing stuff
//var postid = 1;
//var userid = 1;
//**************

var jot_get_posts_url = 'http://www.simplyjot.com/simplyjot/index.php/myposts/getallmyposts';
var jot_create_post_url = 'http://www.simplyjot.com/simplyjot/index.php/myposts/createnewpost';
var jot_login_url = 'http://www.simplyjot.com/simplyjot/index.php/site/externalLoginMobile?provider=';
var jot_login_auth_check_url = "http://www.simplyjot.com/simplyjot/index.php/site/externalLoggedInMobile";
var jot_logout_url = "http://www.simplyjot.com/simplyjot/index.php/site/externalLogoutMobile";

var app = angular.module('jot', ['ngTouch', 'ngRoute']);
//var jot_login_url2 = 'http://www.simplyjot.com/simplyjot/index.php/site/externalLoginMobile?';

app.controller('frontpageCtrl', function ($scope, $rootScope, $window, LoginService) {

  $scope.init = function () {
    LoginService.checkLoggedIn().then(function(response) {
      alert("response status: " + response.status + ", data: " + response.data);
      if(response.data == 1) {
        $rootScope.$broadcast('getAllPosts');
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
      alert("Post request ERROR with status: " + errorResponse.status + ", data:" + errorResponse.data);
    });
  };

  angular.element(document).ready(function () {
    $scope.init();
  });


  $scope.getWidth = function() {
    return $window.innerWidth;
  };

  $scope.getHeight = function() {
    return $window.innerHeight;
  };

  $scope.setCSSForLogoWidth = function() {
    alert('width: ' + $scope.windowWidth);

    $('.span-frontpage-logo img').css({
        // Using jQuery CSS we write the $width variable we previously specified as a pixel value. We use max-width incase the image is smaller than our viewport it won't scale it larger. Don't forget to set height to auto or else it will squish your photos.
      'max-width' : $scope.windowWidth/1.5, 
      'height' : 'auto',
      'margin': '0 auto',
      'display': 'block'
    });
  };

  $scope.setCSSForLogoHeight = function() {
    alert('height: ' + $scope.windowHeight);
    
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


app.controller('ListCtrl', function ($scope, $http, $window) {

  $scope.postText = ''; //initialise it to empty string as it is null initially i believe
  $scope.posts = [];
  // $scope.posts = [
  //   {postContent:'This is the first item in the list', id: 0},
  //   {postContent:'New items are inserted to the top of the list', id: 1}];
  //$scope.posts.reverse();  
  $scope.deletePostList = [];

  $scope.$on('getAllPosts', function() {
    $scope.requestPosts();
  });

  $scope.requestPosts = function() {
    $http({
      method: 'GET', 
      url: jot_get_posts_url,
    })
    .then(function(response) {
      console.log("Post with status: " + response.status + ", data: " + response.data);
      alert("Post with status: " + response.status + ", data: " + response.data);
      //$scope.posts = response.data;
      $scope.posts = [];
      angular.forEach(response.data, function(jsonData) {
        var post = new Post();
        post.id = jsonData.id;
        post.postContent = jsonData.postContent;
        post.timePosted = jsonData.timePosted;
        post.synced = true;
        $scope.posts.push(post);
      });

      setTimeout(function () {
        $("#postlist").listview("refresh"); 
      }, 1);

    }, function(errorResponse){
      console.log("Post request ERROR with status: " + errorResponse.status + ", data:" + errorResonse.data);
      alert("Post request ERROR with status: " + errorResponse.status + ", data:" + errorResonse.data);
    });

  };

  $scope.addPost = function() {
    if($scope.postText != ''){
      //instead of all the below, i need to make a http post request
      //to the server and then just request latest posts
      //so none of the below would be needed, just the ajax post request
      //postid = postid+1;
      var newPost = new Post();
      //newPost.id = postid;
      newPost.postContent = $scope.postText;

      $scope.posts.reverse();
      //$scope.posts.push({postContent:$scope.postText, id: postid});
      $scope.posts.push(newPost);
      $scope.posts.reverse();

      var xsrf = {'Post[postContent]': $scope.postText,
                  'Post[postType]': 1};

      $http({
      method: 'POST', 
      url: jot_create_post_url,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      data: xsrf
      })
      .then(function(response) {
        console.log("Post with status: " + response.status + ", data: " + response.data);
        alert("Post with status: " + response.status + ", data: " + response.data);
        //$scope.posts = response.data;
        //angular.forEach(response.data, function(jsonData) {
        var postJsonObject = response.data;
        newPost.id = postJsonObject.id;
        newPost.timePosted = postJsonObject.timePosted;
        newPost.synced = true;
        //});

      }, function(errorResponse){
        console.log("Post request ERROR with status: " + errorResponse.status + ", data: " + errorResponse.data);
        alert("Post request ERROR with status: " + errorResponse.status + ", data: " + errorResponse.data);
      });

      $scope.postText = '';
      //$scope.$apply();
      setTimeout(function () {
        $("#postlist").listview("refresh"); 
      }, 1);
      //$("#mainpage").parent().trigger( "create" );
      //$("#postlist").listview("refresh");
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
    alert("post.postContent: " + post.postContent);
    $window.clipboardManagerCopy(
      post.postContent,
      function(r){alert("copy is successful")},
      function(e){alert("error: " + e)}
    );
  };


  //Delete Stuff, doesn't do anything, just UI stuff
  $scope.addToDeleteList = function(post) {
    if (!contains($scope.deletePostList, post.id)){
      $scope.deletePostList.push(post.id);
    }
  };

  $scope.removeFromDeleteList = function(postToDelete) {
    var index = 0;
    angular.forEach($scope.deletePostList, function(postid) {
      if(postid == postToDelete.id){
        $scope.deletePostList.splice(index, 1);
        //$scope.$apply();
        $("#postlist").listview("refresh");
      }
      index = index + 1;
    });  
  };

  $scope.isSwipeDelete = function(post) {
    return contains($scope.deletePostList, post.id);
  };

  $scope.isDeleteListNonEmpty = function() {
    if ($scope.deletePostList.length > 0) {
      return true;
    }
    else {
      return false;
    }
  };

  $scope.clearDeleteOptions = function() {
    $scope.deletePostList = [];
    //$scope.$apply();
  };
 
  $scope.delete = function(selected_post) {
    var index = 0;
    angular.forEach($scope.posts, function(post) {
      if(post.postContent == selected_post.postContent){
        $scope.posts.splice(index, 1);
        $scope.removeFromDeleteList(selected_post);
        //$scope.$apply();
        $("#postlist").listview("refresh");
      }
      index = index + 1;
    });  
  };

});


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


app.service('LoginService', function ($http, $q) {

  this.checkLoggedIn = function() {
    var deferred = $q.defer();
    $http({
      method: 'GET', 
      url: jot_login_auth_check_url,
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
}
