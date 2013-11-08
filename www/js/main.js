
document.addEventListener("deviceready", onDeviceReady, false);

// PhoneGap is loaded and it is now safe to make calls PhoneGap methods
function onDeviceReady() {
    // Register the event listener
    document.addEventListener("backbutton", onBackKeyDown, false);
}

// Handle the back button
function onBackKeyDown() {
  console.log("INSIDE BACK BUTTON");
  navigator.app.exitApp();
}

$(document).on("pageinit", onPageLoad);
//angular.element(document).ready(onMobileInit);

function onPageLoad() {// Document.Ready
  console.log("document ready");
  $('.iscroll-wrapper').on('iscroll_onscrollmove', infiniteScrolling);
}

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

