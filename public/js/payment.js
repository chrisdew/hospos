

function PaymentCtrl($scope, $routeParams, $http) {
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
    
	$scope.totalToPay = parseInt($routeParams.totalToPay, 10);
	
	$scope.cashTenderedBlur = function() {
		console.log('cashTenderedBlur');
		if ($scope.cash.tendered > 0 && $scope.cash.change === 0 && $scope.outstanding() < 0) {
			$scope.cash.change = -$scope.outstanding();
		}
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
		return $scope.cash.amount() + ($scope.card.cardNo ? $scope.card.amount : 0) + $scope.cheque.amount;
	}
	$scope.outstanding = function() {
		return $scope.totalToPay - $scope.paymentTotal();
	}
}

function PaymentTypeCtrl($scope, $rootScope) {
	$scope.types = [{name: 'Cash'},
	                {name: 'Cheque'},
	                {name: 'Card'}
	                ];
    $scope.select = function(type) {
    	$rootScope.$broadcast('selectedPayementType', type);
    }
}
