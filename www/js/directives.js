var appDirectives = angular.module('app.directives', []);

//Directive using Hammer.js for tap-hold
appDirectives.directive('onHold', function () {
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


appDirectives.directive('jqueryMobileTpl', function () {
    return {
        link: function (scope, elm, attr) {
            elm.listview('refresh');
        }
    };
});
appDirectives.directive('repeatDone', function () {
    return function (scope, element, attrs) {
        // When the last element is rendered
        if (scope.$last) { 
            element.parent().parent().listview('refresh');
        }
    }
});