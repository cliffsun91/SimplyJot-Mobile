var appFilters = angular.module('app.filters', []);

appFilters.filter('orderPostsByTimePosted', function(){
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