var appControllers = angular.module('app.controllers', []);

appControllers.controller('frontpageCtrl', function ($scope, $rootScope, $window, ResourceService) {

  $scope.checkLogin = function () {
    ResourceService.getResource(jot_login_auth_check_url).then(function(response) {
      //alert("response status: " + response.status + ", data: " + response.data);
      if(response.data == 1) {
        $rootScope.$broadcast('getInitPosts');
        $.mobile.changePage("#mainpage", {transition: "slide"});
      }
      else if(response.data == 0) {
        $.mobile.changePage("#login", {transition: "slide"});
      }
      else {
        console.log("Error response expected 0 or 1, actual response: " + response.status + ", " + response.data);
      }
    },
    function(errorResponse) {
      console.log("Post request ERROR with status: " + errorResponse.status + ", data:" + errorResponse.data);
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
    $('.span-frontpage-logo img').css({
        // Using jQuery CSS we write the $width variable we previously specified as a pixel value. We use max-width incase the image is smaller than our viewport it won't scale it larger. Don't forget to set height to auto or else it will squish your photos.
      'max-width' : $scope.windowWidth/1.5, 
      'height' : 'auto',
      'margin': '0 auto',
      'display': 'block'
    });
  };

  $scope.setCSSForLogoHeight = function() {    
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


appControllers.controller('LoginCtrl', function ($scope, $rootScope, $window, $http) {

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


appControllers.controller('LogoutCtrl', function ($scope, $http, $window) {
  
  $scope.logout = function() {
    var user_email = $window.localStorage.getItem("user_email");
    var message = "Are you sure you want to log out? User: " + user_email;
    navigator.notification.confirm(message, $scope.logoutCallback, "Logout?", ["OK", "Cancel"]);
  };

  $scope.logoutCallback = function(buttonIndex) {
    if(buttonIndex == 1) {
      $http({
        method: 'GET', 
        url: jot_logout_url,
      })
      .then(function(response) {
        console.log("Logging out: " + response.status + ", data: " + response.data);
        $scope.posts = [];
        $window.localStorage.clear();
        $.mobile.changePage("#login", {transition: "slide", reverse: "true"});
      }, function(errorResponse){
        console.log("Logging out ERROR with status: " + errorResponse.status + ", data:" + errorResponse.data);
        var message = "Can't connect to the server, try again later.";
        navigator.notification.alert(message, "", "Error", "Dismiss");
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


appControllers.controller('ListCtrl', function ($scope, $http, $window, $timeout, ResourceService, socket) {

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

        //add a timeout wrapper here if you want to simulate network congestion
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
          $("#postlist").listview("refresh");
          $scope.requestingPosts = false; 
        }, 1);
        //finish wrap

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
        exists = true;
      }
    });
    return exists;
  };

  $scope.getOldestIdOfPosts = function() {
    var oldestPost = $scope.posts[$scope.posts.length - 1];
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

      $scope.postText = '';

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
        // alert("Post request ERROR with status: " + errorResponse.status + ", data: " + errorResponse.data);
        var message = "Can't add at the moment. Try again later.";
        navigator.notification.alert(message, function(buttonIndex){
            $scope.$apply(removePostFromPosts(newPost));
        }, "Error", "Dismiss");
        
        $scope.postText = newPost.postContent;
      });

      $timeout(function () {
        $("#postlist").listview("refresh"); 
      }, 1);
    }
  };

  var removePostFromPosts = function(postToRemove) {
    var index = 0;
    angular.forEach($scope.posts, function(post) {
      if(post == postToRemove){
        $scope.posts.splice(index, 1);
        $("#postlist").listview("refresh");
        $(".iscroll-wrapper").iscrollview("refresh");
      }
      index = index + 1;
    });  
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
    removePostFromPosts(selected_post);
  };

  $scope.isRequestingDelete = function(post) {
    if($scope.requestingDelete == null){
      return false;
    }
    else{
      return post.id == $scope.requestingDelete.id;
    }
  };

  $scope.loadMoreOlder = function() {
    if(!$scope.requestingPosts && !$scope.requestedAllOlderPosts){
      alert('infinite scroll!');
      $scope.requestNextOlderPosts();
      $(".iscroll-wrapper").iscrollview("refresh");
    }
  };

});