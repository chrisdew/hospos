function InvoiceLine(ob) { 
	console.log("InvoiceLine");
	for (var p in ob) {
		this[p] = JSON.parse(JSON.stringify(ob[p]));
	}
}

InvoiceLine.prototype.lineType = 'stock';

InvoiceLine.prototype.lineTotal = function() {
	console.log("lineTotal");
	return this.salprc_u * this.qty - this.lineDiscount;
}

InvoiceLine.prototype.goods = function() {
	console.log("goods");
	return this.salprc_u * this.qty - this.lineDiscount;
}

InvoiceLine.prototype.vat = function() {
	console.log("vat");
	var vat = (this.salprc_e - this.salprc_u) * this.qty;
	var vatRate = this.salprc_e / this.salprc_u - 1;
	console.log("vatRate", vatRate);
	return Math.floor(vat - this.lineDiscount * vatRate);
}

function NarrativeLine(narrative) { 
	console.log("NarrativeLine");
	this.narrative = narrative;
}

NarrativeLine.prototype.lineTotal = function() {
	console.log("lineTotal");
	return 0;
}

NarrativeLine.prototype.lineType = 'narrative';

var timeout = false;
function CartCtrl($scope, $http, $rootScope, $routeParams) {
	
	setUser($routeParams.user);
	$scope.user = window.state.user;
	
	$scope.items = [
	];
	window.state.items = $scope.items;
	
	// this controls popup picklist, when null, it is not displayed
	$scope.picklist = null; 

	$scope.itemInput = '';
	$scope.validItem = null;
	$scope.itemQty = 1;
	$scope.lineDiscount = 0;
	
	$scope.invoiceSubtotal = function() {
		// TODO: refactor this, it's a mess
		return _.foldl($scope.items, function(memo, item) { return item.salprc_u ? (item.salprc_u * item.qty - item.lineDiscount + memo) : memo; }, 0);
	}

	$scope.invoiceVat = function() {
		// TODO: refactor this, it's a mess
		//return _.foldl($scope.items, function(memo, item) { return item.salprc_e ? ((item.salprc_e - item.salprc_u) * item.qty - (item.salprc_u - item.salprc_e) * item.lineDiscount) : memo; }, 0);
		return _.foldl($scope.items, function(memo, item) { 
			if (!item.salprc_e) return memo;
			var vat = (item.salprc_e - item.salprc_u) * item.qty;
			var vatRate = item.salprc_e / item.salprc_u - 1;
			console.log("vatRate", vatRate);
			return vat - item.lineDiscount * vatRate + memo;
		}, 0);
	}
	
	$scope.invoiceTotal = function() {
		return $scope.invoiceSubtotal() + $scope.invoiceVat();
	}
	
	$scope.select = function(item) {
		$rootScope.$broadcast('selectedStockItem2', item);
		$scope.picklist = null;
	}

	// FIXME: see http://stackoverflow.com/questions/11591902/angularjs-can-a-on-method-be-called-more-than-once-for-a-single-broadcast
	function debounced_alert(str) {
		if (!timeout) {
			console.log("debounced_alert fire", this);
			timeout = setTimeout(function() { timeout = false; }, 4000);
			alert(str);
		} else {
			console.log("debounced_alert forget");
		}
	}

	$scope.validQty = function(item, qty) {
		console.log("validQty", qty, item);
		if (qty > item.b_each) {
			console.log("too much");
			if (window.state && window.state.user && window.state.user.perms) {
				console.log("perms found");
				if (_.indexOf(window.state.user.perms, CAN_SELL_OUT_OF_STOCK_ITEM) !== -1) {
					console.log("return true");
					return true;
				}
			}
			debounced_alert("not enough stock");
			console.log("not enough stock");
			return false;
		}
		return true;
	}

	$scope.allowLineDiscount = function() {
		if (window.state && window.state.user && window.state.user.perms) {
			console.log("perms found");
			if (_.indexOf(window.state.user.perms, ALLOW_LINE_DISCOUNT) !== -1) {
				console.log("return true");
				return true;
			}
		}
		return false;
	}

	$scope.onscreenNumpad = function() {
		if (window.state && window.state.user && window.state.user.perms) {
			console.log("perms found");
			if (_.indexOf(window.state.user.perms, ONSCREEN_NUMPAD) !== -1) {
				console.log("return true");
				return true;
			}
		}
		return false;
	}
	
    $scope.validSalesPerson = function(item) {
    	console.log("validSalesPerson");
    	if (item.prod_grp === '76') {
			if (window.state && window.state.user && window.state.user.perms) {
				console.log("perms found");
				if (_.indexOf(window.state.user.perms, CAN_SELL_ALCOHOL) !== -1) {
					console.log("return true");
					return true;
				}
			}
			debounced_alert("you cannot sell alcohol, as you are not 18");
			return false;
    	}
    	return true;
    }

	$scope.addItemToCart = function(item, qty, lineDiscount) {
		console.log("addItemToCart", item, qty);
		// if the item's already in the cart, just inc the qty
		var matchingItem = _.find($scope.items, function(cartItem) { 
			console.log('cartItem', cartItem, 'item', item);
			return cartItem.key1p2 === item.key1p2; 
		});
		console.log('matchingItem', matchingItem)
		if (matchingItem) {
			// TODO: refactor
			if (!$scope.validQty(item, matchingItem.qty + qty) || !$scope.validSalesPerson(item)) {
				return;
			}
			matchingItem.qty += qty;
			if (lineDiscount) {
				matchingItem.lineDiscount += lineDiscount;
			}
		} else {
			// TODO: refactor
			if (!$scope.validQty(item, qty) || !$scope.validSalesPerson(item)) {
				return;
			}
			var line = new InvoiceLine(item);
			line.qty = qty;
			if (lineDiscount) {
				line.lineDiscount = lineDiscount;
			} else {
				line.lineDiscount = 0;				
			}
			$scope.items.push(line);
			console.log(line);
		}
		
		clearInput();
	}
	
	var addNarrativeToCart = function(narrative) {
    	$scope.items.push(new NarrativeLine(narrative));		
    	clearInput();
	}
	
	function clearInput() {
        $scope.itemInput = '';
        $scope.itemQty = 1;
        $scope.validItem = null;
        $scope.lineDiscount = 0;
        $('itemInput').focus();
	}
	

	$scope.addItem = function() {
		$scope.addItemToCart($scope.validItem, $scope.itemQty, $scope.lineDiscount);
	}
	
    $scope.itemInputOnKeyupEnter = function(e) {
    	console.log("itemInputOnKeyupEnter", e);
   		if ($scope.itemInput.length > 2) {
console.log("DEBUG");
            if ($scope.itemInput[0] == '!') {
            	addNarrativeToCart($scope.itemInput);
            } else {
            	if (!$scope.validItem) {
            		$scope.lookup();
            	} else {
            		$scope.addItem();
            	}
            }
  		} else { //get rid of valid item
   			$scope.validItem = null;
   		}
    }
    

	$scope.lookup = function() {
    	// try it as a stock code
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
		if (!window.counter) {
			console.log("first call");
			window.counter = 1;
		} else {
			console.log("call", window.counter);
			window.counter++;
			//throw "second_call";
		}
		console.log('selectedStockItem');
		$scope.addItemToCart(item, 1);
	});
	$scope.$on('selectedStockItem2', function(e, item) {
		console.log('selectedStockItem2');
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
    	console.log('broadcast selectedStockItem', item);
    	$rootScope.$broadcast('selectedStockItem', item);
    }
}
