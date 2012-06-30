$(function() {
	console.log("DOM loaded");
	$('#itemInput').keyup(function(e) {
		console.log("keyup", e);
		window.itemInputOnKeyUp(e);
	});
});


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

function CartCtrl($scope, $http) {
	$scope.items = [
	];
	
	$scope.itemInput = '';
	$scope.validItem = null;
	$scope.itemQty = 1;
	
	$scope.invoiceSubtotal = function() {
		return _.foldl($scope.items, function(memo, item) { return item.salprc_u * item.qty + memo; }, 0)
	}

	$scope.invoiceVat = function() {
		return _.foldl($scope.items, function(memo, item) { return (item.salprc_e - item.salprc_u) * item.qty + memo; }, 0)
	}
	
	$scope.invoiceTotal = function() {
		return $scope.invoiceSubtotal() + $scope.invoiceVat();
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
	
    window.itemInputOnKeyUp = function(e) {
    	console.log("itemInputOnKeyUp", e);
    	$scope.$apply(function() {
    		if (e.keyCode === 13) { // enter
console.log("DEBUG");
                if (!$scope.validItem) {
                	$scope.lookup();
                } else {
                	$scope.addItem();
                }
    		} else { //get rid of valid item
    			$scope.validItem = null;
    		}
    	});
    }
    

	$scope.lookup = function() {
    	// first try it as a stock code
    	$http.get('/api/stock/' + $scope.itemInput + '/').success(function(items) {
    		console.log('as stock code', items);
    		if (items.length === 0) {
    			$http.get('/api/stock/barcode/' + $scope.itemInput + '/').success(function(items) {
    				console.log('as barcode', items);
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


