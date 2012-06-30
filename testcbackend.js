#!/usr/bin/env node
var c = require('cbackend');
console.log('c.hello', c.hello);
console.log('c.get_groups()', c.get_groups());
console.log("c.get_subgroups('72')", c.get_subgroups('72'));
console.log("c.get_stock_by_group('71')", c.get_stock_by_group('71'));
console.log("c.get_stock_by_group('72', '02')", c.get_stock_by_group('72', '02'));
console.log("c.get_stock_by_key1p2('0002')", c.get_stock_by_key1p2('0002'));
console.log("c.get_stock_by_barcode('45678')", c.get_stock_by_barcode('45678'));
