angular.module('hospos', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/hospos', {templateUrl: 'partials/cart.html',   controller: CartCtrl}).
      when('/hospos/payment', {templateUrl: 'partials/payment.html', controller: PaymentCtrl}).
      otherwise({redirectTo: '/hospos'});
}]);