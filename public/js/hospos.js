//$(function() {
//	console.log("DOM loaded");
//	$('#ng_view').on('keyup', '#itemInput', function(e) {
//		console.log("keyup", e);
//		window.itemInputOnKeyUp(e);
//	});
//});


function InvoiceLine(ob) { 
	console.log("InvoiceLine");
	for (var p in ob) {
		this[p] = JSON.parse(JSON.stringify(ob[p]));
	}
}
InvoiceLine.prototype.lineTotal = function() {
	console.log("lineTotal");
	return this.salprc_u * this.qty;
}

function CartCtrl($scope, $http, $rootScope) {
	
	$scope.items = [
	];
	
	// this controls popup picklist, when null, it is not displayed
	$scope.picklist = null; 

	$scope.itemInput = '';
	$scope.validItem = null;
	$scope.itemQty = 1;
	
	$scope.invoiceSubtotal = function() {
		return _.foldl($scope.items, function(memo, item) { return item.salprc_u * item.qty + memo; }, 0);
	}

	$scope.invoiceVat = function() {
		return _.foldl($scope.items, function(memo, item) { return (item.salprc_e - item.salprc_u) * item.qty + memo; }, 0);
	}
	
	$scope.invoiceTotal = function() {
		return $scope.invoiceSubtotal() + $scope.invoiceVat();
	}
	
	$scope.select = function(item) {
		$rootScope.$broadcast('selectedStockItem2', item);
		$scope.picklist = null;
	}

	$scope.addItemToCart = function(item, qty) {
		// if the item's already in the cart, just inc the qty
		var matchingItem = _.find($scope.items, function(cartItem) { 
			console.log('cartItem', cartItem, 'item', item);
			return cartItem.key1p2 === item.key1p2; 
		});
		console.log('matchingItem', matchingItem)
		if (matchingItem) {
			matchingItem.qty += qty;
		} else {
			var line = new InvoiceLine(item);
			line.qty = qty;
			$scope.items.push(line);
			console.log(line);
		}
				
		$scope.itemInput = '';
		$scope.itemQty = 1;
		$scope.validItem = null;
	}
	
	$scope.addItem = function() {
		$scope.addItemToCart($scope.validItem, $scope.itemQty);
	}
	
    $scope.itemInputOnKeyupEnter = function(e) {
    	console.log("itemInputOnKeyupEnter", e);
   		if ($scope.itemInput.length > 2) {
console.log("DEBUG");
            if (!$scope.validItem) {
               	$scope.lookup();
            } else {
            	$scope.addItem();
            }
  		} else { //get rid of valid item
   			$scope.validItem = null;
   		}
    }
    

	$scope.lookup = function() {
    	// first try it as a stock code
    	$http.get('/api/stock/' + $scope.itemInput + '/').success(function(items) {
    		console.log('as stock code', items);
    		if (items.length === 0) {
    			$http.get('/api/stock/barcode/' + $scope.itemInput + '/').success(function(items) {
    				console.log('as barcode', items);
    				if (items.length === 0) {
    					$http.get('/api/stock/search/' + $scope.itemInput + '/').success(function(items) {
    	    				console.log('as F3 search', items);
    	    				$scope.picklist = items;
    	    				// display list of first 10 matching items
    					});
    				}
    				$scope.validItem = items[0];
    			});
    		} else {
    			$scope.validItem = items[0];
    		}
    	});
    }

    


	$scope.$on('selectedStockItem', function(e, item) {
		$scope.addItemToCart(item, 1);
	});
	$scope.$on('selectedStockItem2', function(e, item) {
		$('#itemInput').focus();
		$scope.validItem = item;
		$scope.itemInput = item.key1p2;
	});
}

function OskCtrl($scope) {
	$scope.pressed = function(key) {
		console.log(key, 'pressed');
		var input = $(window.oskInput);
		var val = input.val();
		if ( key === '-' || key === 0 || key === 1 || key === 2 || key === 3 || key === 4 
		  || key === 5 || key === 6 || key === 7 || key === 8 || key === 9 || key === '.') {
			input.val(val + key);
		}
		if (key === 'backspace' && val.length > 0) {
			input.val(val.substring(0, val.length-1));
		}
		input.focus();
	}
}

function StockGroupCtrl($scope, $http, $rootScope) {
	$scope.groups = [];
	$scope.selectedGroup = 'none';
	$scope.handleGroupsLoaded = function(data, status) {
		$scope.groups = data;
	}
    $scope.fetch = function() {
    	$http.get('/api/stock/groups/').success($scope.handleGroupsLoaded);
    }
    $scope.fetch();
    $scope.select = function(prod_grp) {
    	$scope.selectedGroup = prod_grp;
    	$rootScope.$broadcast('selectedGroup', prod_grp);
    	//window.fetchStockSubgroups(prod_grp);
    }
}

function StockSubgroupCtrl($scope, $http, $rootScope) {
	$scope.prod_grp = null;
	$scope.subgroups = [];
	$scope.handleSubgroupsLoaded = function(data, status) {
		$scope.subgroups = data;
		if (!data.length) { // load items now, if there are no subgroups
			$rootScope.$broadcast('selectedSubgroup', $scope.prod_grp);
		} else { // otherwise clear the item screen, while we wait for a subcat to be chosen
			$rootScope.$broadcast('selectedSubgroup');
		}
	}
    $scope.fetch = function(prod_grp) {
    	$http.get('/api/stock/groups/' + prod_grp + '/subgroups/').success($scope.handleSubgroupsLoaded);
    }
    $scope.$on('selectedGroup', function(e, prod_grp) {
    	console.log('eventCaught', prod_grp);
    	$scope.prod_grp = prod_grp;
    	$scope.fetch(prod_grp);
    });
    $scope.select = function(prod_grp, smsgr_id) {
    	$scope.selectedGroup = prod_grp;
    	$scope.selectedSubgroup = smsgr_id;
    	$rootScope.$broadcast('selectedSubgroup', prod_grp, smsgr_id);
    }
}

function StockCtrl($scope, $http, $rootScope) {
	$scope.items = [];
	$scope.handleItemsLoaded = function(data, status) {
		$scope.items = data;
	}
	$scope.fetch = function(prod_grp, smsgr_id) {
		var frag = '';
		if (smsgr_id) {
			frag = 'subgroups/' + smsgr_id + '/'; 
		}
    	$http.get('/api/stock/groups/' + prod_grp + '/' + frag + 'items/').success($scope.handleItemsLoaded);
    }
	$scope.$on('selectedSubgroup', function(e, prod_grp, smsgr_id) {
    	console.log('eventCaught', prod_grp, smsgr_id);
    	if (prod_grp) {
    		$scope.fetch(prod_grp, smsgr_id);
    	} else { // we're waiting for a subgroup
    		$scope.items = [];
    	}
    });
    $scope.select = function(item) {
    	$rootScope.$broadcast('selectedStockItem', item);
    }
}


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
