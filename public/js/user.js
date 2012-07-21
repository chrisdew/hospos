var CAN_SELL_OUT_OF_STOCK_ITEM = 'CAN_SELL_OUT_OF_STOCK_ITEM';
var CAN_ACCEPT_CHEQUES = 'CAN_ACCEPT_CHEQUES';
var ONSCREEN_NUMPAD = 'ONSCREEN_NUMPAD';
var CAN_SELL_ALCOHOL = 'CAN_SELL_ALCOHOL';
var ALLOW_LINE_DISCOUNT = 'ALLOW_LINE_DISCOUNT';
var ALLOW_INVOICE_DISCOUNT = 'ALLOW_INVOICE_DISCOUNT';
	                                      

function UserCtrl($scope, $location) {
	$scope.users = [{name: 'Rod', 
					 perms: [CAN_SELL_OUT_OF_STOCK_ITEM,
	                         CAN_ACCEPT_CHEQUES,
	                         ONSCREEN_NUMPAD,
	                         CAN_SELL_ALCOHOL,
	                         ALLOW_LINE_DISCOUNT,
	                         ALLOW_INVOICE_DISCOUNT
	                         ],
	                 notes: 'All permissions, on-screen numpad.'},
	                {name: 'Jane', 
	                 perms: [CAN_SELL_OUT_OF_STOCK_ITEM,
	                         CAN_ACCEPT_CHEQUES,
		                     CAN_SELL_ALCOHOL,
		                     ALLOW_LINE_DISCOUNT,
		                     ALLOW_INVOICE_DISCOUNT
	                         ],
	                 notes: 'All permissions.'},
	                {name: 'Freddy', 
	                 perms: [],
	                 notes: 'No permissions.'}
	                ];
    $scope.select = function(user) {
    	window.state.user = user;
    	$location.url('/hospos/' + user.name + '/cart');
    }
}

