

function PaymentCtrl($scope, $routeParams, $http, $routeParams) {
	
	setUser($routeParams.user);
	$scope.user = window.state.user;
	$scope.showCheque = _.indexOf($scope.user.perms, CAN_ACCEPT_CHEQUES) === -1 ? false : true;

    $scope.cash = { tendered: 0,
                    change: 0,
                    amount: function() {
    	              return this.tendered - this.change;
                    }
                  };
    $scope.card = { cardNo: undefined,
                    expDate: undefined,
                    amount: 0
    			  }
    $scope.cheque = { amount: 0 }
    $scope.discount = { amount: 0 }
    
	$scope.totalToPay = parseInt($routeParams.totalToPay, 10);
	
	$scope.cashTenderedBlur = function() {
		console.log('cashTenderedBlur');
		if ($scope.cash.tendered > 0 && $scope.cash.change === 0 && $scope.outstanding() < 0) {
			$scope.cash.change = -$scope.outstanding();
		}
	}
	
	$scope.allowInvoiceDiscount = function() {
		if (window.state && window.state.user && window.state.user.perms) {
			console.log("perms found");
			if (_.indexOf(window.state.user.perms, ALLOW_INVOICE_DISCOUNT) !== -1) {
				console.log("return true");
				return true;
			}
		}
		return false;
	}
	
	/*
	$scope.cashTenderedOnKeyUp = function() {
		console.log('cashTenderedOnKeyUp', window.lastKeyEv);
		if (window.lastKeyEv.keyCode === 13) {
			// move to next input, if this one is valid
		}
	}
	*/
	
	$scope.cashChangeBlur = function() {
		if ($scope.cash.change > 0) {
			$http.get('/api/till/open/');
		}
	}
	
	$scope.cardOnKeyupEnter = function() {
		if ($scope.card.amount === 0) return true;
		$scope.card.info = "Please insert card now.";
		$scope.card.warning = undefined;
		$scope.card.cardNo = undefined;
		$scope.card.expDate = undefined;
		// FIXME: should this be a POST to avoid caching?
		$http.get('/api/card/read/' + $scope.card.amount + '/').success(function(data, status) {
			$scope.card.info = data.info;
			$scope.card.warning = data.warning;
			$scope.card.cardNo = data.cardNo;
			$scope.card.expDate = data.expDate;
		});
	}
	
	$scope.paymentTotal = function() {
		return $scope.cash.amount() + ($scope.card.cardNo ? $scope.card.amount : 0) + $scope.cheque.amount + $scope.discount.amount;
	}
	$scope.outstanding = function() {
		var outstanding = $scope.totalToPay - $scope.paymentTotal();
		if (outstanding < 0.5 && outstanding > -0.5) return 0;
		return outstanding;
	}
	
	$scope.complete = function() {
		console.log("completing invoice");

		var invoice = createInvoice("000001", window.state.items, $scope.totalToPay, {cash: $scope.cash, card: $scope.card, cheque: $scope.cheque, discount: $scope.discount});

		$http.post('/api/invoice/complete/', invoice).success(function(data, status) {
			alert("invoice completed");
		});
	}
}

function PaymentTypeCtrl($scope, $rootScope) {
	$scope.types = [{name: 'Cash'},
	                {name: 'Cheque'},
	                {name: 'Card'}
	                ];
    $scope.select = function(type) {
    	$rootScope.$broadcast('selectedPaymentType', type);
    }
}
