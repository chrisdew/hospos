var app = angular.module('hospos', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/hospos', {templateUrl: 'partials/cart.html',   controller: CartCtrl}).
      when('/hospos/payment/:totalToPay', {templateUrl: 'partials/payment.html', controller: PaymentCtrl}).
      otherwise({redirectTo: '/hospos'});
}]);
  
app.directive('onFocus', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            console.log('onfocus');
            elm.bind('focus', function() {
                scope.$apply(attrs.onFocus);
            });
        }
    };        
});
app.directive('onBlur', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            elm.bind('blur', function() {
                scope.$apply(attrs.onBlur);
            });
        }
    };        
});

var CURRENCY_REGEXP = /^\-?\d+(\.?\d?\d?)?$/;
app.directive('currency', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (CURRENCY_REGEXP.test(viewValue)) {
          // it is valid
          ctrl.$setValidity('currency', true);
          console.log("valid");
          return viewValue * 100;
        } else if (viewValue === '') {
          return 0;
        } else {
          // it is invalid, return undefined (no model update)
          ctrl.$setValidity('currency', false);
          console.log("invalid");
          return undefined;
        }
      });
      ctrl.$formatters.push(function(modelValue) {
    	 if (modelValue === 0) { // we're using integer pence, so this is safe
    		 return '';
    	 }
    	 return (modelValue / 100).toFixed(2); 
      });
    }
  };
});

app.filter('currency', function() {
  return function(input) {
    return (input / 100).toFixed(2);
  }
});

/*
app.directive('onKeyUp', function() {
  return function(scope, elm, attrs) {
    elm.bind("keyup", function(ev) {
      console.log('args', ev, scope);
      window.lastKeyEv = ev;
      scope.$apply(attrs.onKeyUp);
    });
  };
});


app.directive('onCr', function() {
  return function(scope, elm, attrs) {
    elm.bind("keyup", function(ev) {
      console.log('onCr', elm, ev, scope);
      $(elm).change(function() {
        var inputs = $(this).closest('form').find(':input');
    	inputs.eq( inputs.index(this)+ 1 ).focus();
      });
    });
  };
});
	
app.directive('onKeyupFn', function() {
    return function(scope, elm, attrs) {
        //Evaluate the variable that was passed
        //In this case we're just passing a variable that points
        //to a function we'll call each keyup
        var keyupFn = scope.$eval(attrs.onKeyupFn);
        elm.bind('keyup', function(evt) {
            //$apply makes sure that angular knows 
            //we're changing something
            scope.$apply(function() {
                keyupFn.call(scope, evt.which);
            });
        });
    };
});

app.directive('onKeyup', function() {
    return function(scope, elm, attrs) {
        function applyKeyup() {
          scope.$apply(attrs.onKeyup);
        };           
        
        var allowedKeys = scope.$eval(attrs.keys);
        elm.bind('keyup', function(evt) {
            //if no key restriction specified, always fire
            if (!allowedKeys || allowedKeys.length == 0) {
                applyKeyup();
            } else {
                angular.forEach(allowedKeys, function(key) {
                    if (key == evt.which) {
                        applyKeyup();
                    }
                });
            }
        });
    };
});
*/

function nextOnTabIndex(element) {
      var fields = $($('form')
                    .find('a[href], button, input, select, textarea')
                    .filter(':visible').filter(':enabled')
                    .toArray()
                    .sort(function(a, b) {
                      return ((a.tabIndex > 0) ? a.tabIndex : 1000) - ((b.tabIndex > 0) ? b.tabIndex : 1000);
                    }));


      return fields.eq((fields.index(element) + 1) % fields.length);
}

app.directive('onKeyupEnterFn', function() {
    return function(scope, elm, attrs) {
        // Evaluate the variable that was passed
        // In this case we're just passing a variable that points
        // to a function we'll call each keyup
        var keyupFn = scope.$eval(attrs.onKeyupEnterFn);
        elm.bind('keyup', function(evt) {
        	if (evt.which != 13) {
        		console.log("enter not pressed", evt.which);
        		return;
        	}
            // $apply makes sure that angular knows 
            // we're changing something
            console.log("enter pressed")
            if (!keyupFn) {
            	console.log("no function provided");
            	nextOnTabIndex($(elm)).focus();
            	return
            }
            scope.$apply(function() {
                var moveToNextField = keyupFn.call(scope, evt.which);
                if (moveToNextField) nextOnTabIndex($(elm)).focus();
            });
        });
    };
});

app.directive('renderOnBlur', function() {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, elm, attrs, ctrl) {
            elm.bind('blur', function() {
            	var viewValue = ctrl.$modelValue;
            	for (var i in ctrl.$formatters) {
            		viewValue = ctrl.$formatters[i](viewValue);
            	}
            	ctrl.$viewValue = viewValue;
            	ctrl.$render();
            });
        }
    };  
});

app.directive('osk', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            elm.bind('focus', function() {
                console.log('osk', elm);
                window.oskInput = elm;
            });
        }
    };        
});

app.directive('oskAutofocus', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            console.log('osk-autofocus', elm);
            window.oskInput = elm;
        }
    };        
});

