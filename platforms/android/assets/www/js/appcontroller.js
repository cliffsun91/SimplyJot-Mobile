$('#mainpage').on('pagebeforeshow', function () {
  $("#mainpage").trigger("create");
});

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
  try {
      //alert("token:" + window.localStorage.getItem("auth_accessToken") + ", email: " + window.localStorage.getItem("auth_email"));
      if(window.localStorage.getItem("auth_accessToken") != null && 
         window.localStorage.getItem("auth_email") != null) {
          $.mobile.changePage("#mainpage");
      } else {
          $.mobile.changePage("#login");
      }
  } catch (exception) {

  } finally {
      //alert("initialise page now!");
      //$.mobile.initializePage();
  }
}


/******************************************************************/
//Angular JS stuff - Controllers etc


//testing stuff
var postid = 1;
var userid = 1;
//**************

var jot_get_posts_url = 'http://www.simplyjot.com/simplyjot/index.php/myposts/getallmyposts';
var jot_login_url = 'http://www.simplyjot.com/simplyjot/index.php/site/externalLoginMobile?provider=';
var app = angular.module('jot', ['ngTouch', 'ngRoute']);
//var jot_login_url2 = 'http://www.simplyjot.com/simplyjot/index.php/site/externalLoginMobile?';



app.controller('LoginCtrl', function ($scope, $window, $http) {

  // $scope.nextPage = function() {
  //   $.mobile.changePage("#mainpage", {transition: "slide"});
  //   //$window.location.href = '/main';
  // };

  $scope.loginExternal = function(method) {
    var ref = $window.open(jot_login_url + method, '_blank', 'location=no');

    ref.addEventListener('loadstop',  function(event){
      var code = '(function(){\n' +
                 '    var foo = document.body.outerText;\n' +
                 '    return foo;\n' +
                 '})()';
      if((event.url).indexOf(jot_login_url + method) != -1) {
        ref.executeScript({code: code}, function(results) {
          if (results && results.length === 1){
            var data =  JSON.parse(results[0]);
            if (data.status == "success"){
              $window.localStorage.setItem("auth_accessToken", data.token);
              $window.localStorage.setItem("auth_email", data.email);    
              $.mobile.changePage("#mainpage", {transition: "slide"});
            }        
            else {
              console.log("Error: status was '" + data.status + "' and status message was '" + data.statusMessage + "'");
            }
            //close the browser
            ref.close();
          }
        });
      }
    });

  };
});


app.controller('ListCtrl', function ($scope, $http, $window) {

  $scope.postText = ''; //initialise it to empty string as it is null initially i believe
  $scope.posts = [];
  // $scope.posts = [
  //   {postContent:'This is the first item in the list', id: 0},
  //   {postContent:'New items are inserted to the top of the list', id: 1}];
  $scope.posts.reverse();  
  $scope.deletePostList = [];


  $scope.requestPosts = function() {
    alert("Post[token] is " + $window.localStorage.getItem("auth_accessToken"));
    alert("Post[email] is " + $window.localStorage.getItem("auth_email"));

    var xsrf = {'Post[token]': $window.localStorage.getItem("auth_accessToken"), 
                'Post[email]': $window.localStorage.getItem("auth_email")};

    $http({
      method: 'POST', 
      url: jot_get_posts_url,
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
      $scope.posts = response.data;
    }, function(errorResponse){
      console.log("Post request ERROR with status: " + errorResponse.status);
      alert("Post request ERROR with status: " + errorResponse.status);
    });

  };

  $scope.addPost = function() {
    if($scope.postText != ''){
      //instead of all the below, i need to make a http post request
      //to the server and then just request latest posts
      //so none of the below would be needed, just the ajax post request
      postid = postid+1;
      $scope.posts.reverse();
      $scope.posts.push({postContent:$scope.postText, id: postid});
      $scope.posts.reverse();
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
      count += 1
    });
    return count;
  };

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

  //$scope.requestPosts();

});

app.directive('jqueryMobileTpl', function () {
    return {
        link: function (scope, elm, attr) {
            elm.listview('refresh');
        }
    };
});
app.directive('repeatDone', function () {
    return function (scope, element) {
        // When the last element is rendered
        if (scope.$last) { 
            element.parent().parent().listview('refresh');
        }
    }
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

