function klone(ob) {
	return JSON.parse(JSON.stringify(ob));
}

function createInvoice(trno, lines, payments) {
	var invoice = [];
	var goods = 0;
	var vat = 0;
	for (i in lines) {
		var line = lines[i];
		if (line.lineType === 'stock') {
			invoice.push(createT2(trno));
			invoice.push(createT4(trno));
			invoice.push(createT5(trno));
			goods += line.goods();
			vat += line.vat();
		} else {
			invoice.push(createT2fromNarrative(trno, line.narrative));
		}
		invoice.push(createT1(trno, new Date().getTime() / 1000, [goods,0,0,0,0,0,0,0,0,0], [vat,0,0,0,0,0,0,0,0,0]));
		invoice.push(createT3(trno));
	}
	return invoice;
}

function createT1(trno, trdt, gvl /*array*/, vat /*array*/, cshv, chng, ccdv, idvl) {
	var t1 = klone(T1);
	t1.trno = trno;
	t1.trdt = trdt;
	for (var i = 0; i < 10; i++) {
		t1['gvl' + i] = gvl[i];
		t1['vat' + i] = vat[i];
	}
	t1.cshv = cshv;
	t1.chng = chng;
	t1.ccdv = ccdv;
	t1.idvl = idvl;
	return t1;
}

var T1 = {
  type:   't1',
  blank:  0,          // multipoint
  trno:   '000001',
  trty:   '1',        // sales and returns
  opno:   1,          // operator no.
  opid:   'OPINIT',   // operator initials
  trdt:   1341156394, // check whether this is simply epoch
  brch:   'smo',      // branch code
  sttn:   1,          // station no.
  srce:   'unknown',  // source of sale
  cuac:   '',         // customer account code
  cuna:   '',         // customer name
  cudc:   0,          // customer discount category
  tert:   0,          // terms
  tedy:   30,         // terms (days)
  bitfld: 0,          // bit 1 = update transient balance, Bit 2=Inc.Vat
  orno:   '',         // order number
  fmss:   0,          // message 1
  smss:   0,          // message 2
  nool:   999,        // number of stock lines
  addr:   0,          // more bit field flags
  gvl0:   999,        // goods
  vat0:   999,        // vat
  gvl1:   999,        // goods
  vat1:   999,        // vat
  gvl2:   999,        // goods
  vat2:   999,        // vat
  gvl3:   999,        // goods
  vat3:   999,        // vat
  gvl4:   999,        // goods
  vat4:   999,        // vat
  gvl5:   999,        // goods
  vat5:   999,        // vat
  gvl6:   999,        // goods
  vat6:   999,        // vat
  gvl7:   999,        // goods
  vat7:   999,        // vat
  gvl8:   999,        // goods
  vat8:   999,        // vat
  gvl9:   999,        // goods
  vat9:   999,        // vat
  idpc:   99,         // invoice discount rate
  idvl:   999,        // invoice discount value
  pyty:   '',         // payment type
  oacp:   999,        // account payment
  chrv:   999,        // book to account amount
  cshv:   999,        // cash payment amount
  vchv:   999,        // voucher 
  chng:   999,        // change given
  chqv:   999,        // cheque
  ccdv:   999,        // credit card
  chqr:   '12345678', // chq ref
  ccdr:   '1234-5678-9012-3456', // cc reference
  ccdt:   'V',        // VISA
  ccda:   '345678',   // authorisation
  ccde:   '0114',     // expiry month
  vcht:   'A',        // voucher type, 'A'von valley
  vchr:   '12345678901234567890', // voucher ref
  trtm:   1341156394, // check whether this is simply epoch
  eor:    0,          // end of MUP8 record
  xstat:  0,          // extract of status
  ptsp_id: '',        // shipment id
  pttm_id: '',        // transport method id
  dlvdate: 1341156394, // check whether this is simply epoch
  txnstat: 0,         // suspense (before completion) status
  txnrefd: '',        // deposit txn ref
  nameaddr: '',       // customer invoice address
  sus_id:  '',        // suspense id
  cacode:  0,         // operator_id which authorised credit
  cdafr_id: 0,        // card auth failure reason id
  idisauth: 0,        // operator_id which authorised discount
  dlvref:  '',        // delivery ref
  suscrdt: 1341156394, // check whether this is simply epoch
  susconfd: 1341156394, // check whether this is simply epoch
  susamd: 1341156394, // check whether this is simply epoch
  susamdby: 0,        // operator_id
  focauth:  0,        // operator_id who authorised FOC
  tvn:      0,        // suspense txn version no
  bskt_el:  0,        // basket editing access level
  spare:    '',
  eor2:     0         // end of MUP9 record
}

function createT2(trno) {
	var t2 = klone(T2);
	t2.trno = trno;
	t2.rtyp = 0;
	t2.rind = 0;
	return t2;
}

function createT2fromNarrative(trno, narrative) {
	var t2 = klone(T2);
	t2.trno = trno;
	t2.rtyp = 2;
	t2.rind = 4;
	t2.code = narrative.substr(0,22);
	t2.pgrp = narrative.substr(22,6);
	return t2;
}

var T2 = {
  type:   't2',
  brch:     'smo',
  sttn:     1,        // station no
  trno:     '000001',
  rtyp:     999,
  rind:     999,
  code:     '',       // stock code
  pgrp:     '',       // product group
  dpip:     2,        // dp in price
  prce:     999,      // selling price
  disc:     999,      // discount
  infc:     0,        // information code
  vatc:     999,      // vat code
  dpiq:     0,        // dp in qty
  qnty:     999,      // qty sold
  cost:     999,      // cost of sale
  upds:     0,        // update status
  eor:      0,        // end of mup8 record
  trdt:     1341156394, // check whether this is simply epoch
  lineno:   999,      
  refndqty: 0,        // qty already refunded
  spare:    '',
  eor2:     0
}


function createT3(tno) {
	var t3 = klone(T3);
	t3.tno = tno;
	t3.invcrn = tno;
	return t3;
}

var T3 = {
  type:   't3',
  tno:      '000001',
  invcrn:   '000001',
  deladdr:  '',
  inv_vat:  999,
  gdsexdsc: 999,      
  gdsexcod: 999,      // goods after discount
  net_doc:  999,
  misc_vat: 999,      // vat on misc charges
  spare1:   '',
  brch:     'smo',
  newpml:   'N',
  zerovat:  'N',
  accsur:   0,        // book to account surcharge
  psavings: 0,
  psvat:    0,
  cashback: 0,
  tedy:     0,
  eor:      0,        // end of mup8 record
  trdt:     1341156394, // check whether this is simply epoch
  sqp_id:   0,        // suitably qualified person
  clo_code: '',       // credit limit override code
  clo_op:   0,        // credit limit override op
  spare3:   '',
  eor2:     0
}

function createT4(tno) {
	var t4 = klone(T4);
	t4.tno = tno;
	t4.invcrn = tno;
	return t4;
}

var T4 = {
  type:     't4',
  tno:      '000001',
  linevat:  '999',
  linedisc: '999',
  netlneva: '999',
  price:    '999',
  brch:     'smo',
  xdisc:    '999',
  hdisc:    '999',
  spare:    '',
  eor:      0,
  trdt:     1341156394, // check whether this is simply epoch
  lineno:   '999',
  spare2:   '',
  eor2:     0
}

function createT5(tno) {
	var t5 = klone(T5);
	t5.tno = tno;
	t5.invcrn = tno;
	return t5;
}

var T5 = {
  type:     't5',
  trno:     '000001',
  lineno:   '999',
  code:     '',         // stock code
  desc:     '',         // stock description
  brch:     'smo',
  expdate:  1341156394, // check whether this is simply epoch
  siunit_d: '',         // selling unit description
  refr_id:  '',         // refund reason
  ldisauth: 0,          // operator id that autheorised line discount
  catex:    999,        // catalog price
  catsex:   999,        // cat selling price
  catinc:   999,        // cat price inc vat
  catsinc:  999,        // cat selling price inc vat
  spare:    '',
  eor:      0,
  trdt:     1341156394, // check whether this is simply epoch
  spare2:   '',
  spare1:   '',
  eor1:     0
}



