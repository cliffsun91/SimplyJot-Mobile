
$(document).bind("mobileinit", onMobileInit);
$(document).bind("pageinit", onPageLoad);

function onMobileInit() {
  //alert("Mobile Init");
  console.log("mobile init");
  $.mobile.autoInitializePage = false;
}

function onPageLoad() {// Document.Ready
  alert("Document Ready");
  console.log("document ready");
  try {
      alert("token:" + window.localStorage.getItem("auth_accessToken") + ", email: " + window.localStorage.getItem("auth_email"));
      if(window.localStorage.getItem("auth_accessToken") != null && 
         window.localStorage.getItem("auth_email") != null) {
          window.location.hash = "#mainpage";
      } else {
          window.location.hash = "#login";
      }
  } catch (exception) {

  } finally {
      alert("initialise page now!");
      $.mobile.initializePage();
  }
}

/******************************************************************/
//Angular JS stuff - Controllers etc

var postid = 1;
var jot_get_posts_url = 'http://www.simplyjot.com/simplyjot/index.php/myposts/getallmyposts';
var userid = 1;
var app = angular.module('jot', ['ngTouch']);
var jot_login_url = 'http://www.simplyjot.com/simplyjot/index.php/site/externalLoginMobile?provider=';
//var jot_login_url2 = 'http://www.simplyjot.com/simplyjot/index.php/site/externalLoginMobile?';


app.controller('LoginCtrl', function ($scope, $window, $http) {

  $scope.loginExternal = function(method) {
    var ref = $window.open(jot_login_url + method, '_blank', 'location=no');

    ref.addEventListener('loadstop',  function(event){
      var code = '(function(){\n' +
                 '    var foo = document.body.outerText;\n' +
                 '    return foo;\n' +
                 '})()';
      //if (event.url == jot_login_url + method){
      if((event.url).indexOf(jot_login_url + method) != -1) {
        ref.executeScript({code: code}, function(results) {
          if (results && results.length === 1){
            var data =  JSON.parse(results[0]);
            //alert("Initial Result: " + data);
            if (data.status == "success"){
              $window.localStorage.setItem("auth_accessToken", data.token);
              $window.localStorage.setItem("auth_email", data.email);    
              //alert("Result: " + data.status + ", " + $window.localStorage.getItem("auth_accessToken") + 
              //                                ", " + $window.localStorage.getItem("auth_email"));
              window.location.hash = "#mainpage";
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


app.controller('ListCtrl', function ($scope, $http) {

  $scope.postText = ''; //initialise it to empty string as it is null initially i believe
  $scope.posts = [];
  //$scope.posts = [
  //  {postContent:'This is the first item in the list', id: 0},
  //  {postContent:'New items are inserted to the top of the list', id: 1}];
  $scope.posts.reverse();  
  $scope.deletePostList = [];


  $scope.requestPosts = function() {
    //alert(jot_get_posts_url);
    $http({
      method: 'JSONP', 
      url: jot_get_posts_url,
      params: {userId: userid, callback: 'JSON_CALLBACK'},
    })
    .then(function(response) {
      $scope.posts = response.data;
      //$scope.$apply();
    });
    // .success(function(data, status, headers, config) {
    //     $scope.posts = data;
    //     //alert('Success! data:' + data + ", status: " + status);
    // }).error(function(data, status, headers, config) {
    //     alert('Error! data:' + data + ", status: " + status);
    //     console.info("data: " + data + "status: " + status);
    // });

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
      $("#postlist").listview("refresh");
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
    // var msg = 'Hello';
    // var options = {
    //   resolve: {
    //     msg: function () { return msg; }
    //   }
    // };
    // var dialog = $dialog.dialog(options);
    
    // dialog.open('index_old.html', 'DCtrl');

  //   $('<div>').simpledialog2({
  //     mode: 'button',
  //     //dialogAllow: true,  
  //     width: '200px',
  //     headerText: 'Confirm',
  //     headerClose: true,
  //     buttonPrompt: 'Are you sure?',
  //     buttons : {
  //       'OK': {
  //         click: function () { 
  //           var index = 0;
  //           angular.forEach($scope.posts, function(post) {
  //             if(post.text == selected_post.text){
  //               $scope.posts.splice(index, 1);
  //               $scope.$apply();
  //               $("#postlist").listview("refresh");
  //             }
  //             index = index + 1;
  //           });     
  //         }
  //       },
  //       'Cancel': {
  //         click: function () { 

  //         },
  //         icon: "delete",
  //         theme: "c"
  //       }
  //     }
  //   })
  //   //alert('delete ' + post.id + '?');
  //   //$scope.posts.remove()
  // };

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


// app.factory('postService', function($http) {
//   return {
//     getPosts: function() {
//       return   
//         $http({
//           method: 'GET', 
//           url: jot_get_posts_url,
//           params: {userId: '1'}
//         })
//         .then(function(result) {
//            return result.data;
//           //alert('data is: ' + data);
//         });
//     }
//   }
// });

// app.directive('jqueryMobileTpl', function() {
//   return {
//     link: function(scope, elm, attr) {
//       elm.trigger('create');
//     }
//   };
// });

// app.directive('confirmationNeeded', function () {
//   return {
//     priority: 1,
//     terminal: true,
//     link: function (scope, element, attr) {
//       var msg = attr.confirmationNeeded || "Are you sure?";
//       var clickAction = attr.ngClick;
//       element.bind('click',function () {
//         if ( window.confirm(msg) ) {
//           scope.$eval(clickAction)
//         }
//       });
//     }
//   };
// });

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


//window.mySwipe = Swipe(document.getElementById('swipelist'));