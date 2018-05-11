function utCode() { 
	gApLocationsHNS0A326 = [ [83.67, 93.33], [36.65, 93.55], [36.65, 20.56], [83.67, 20.56], [36.65, 40.58], [36.65, 60.58] ];
    gStoreLocationMap['HNS0A326'] = gApLocationsHNS0A326;

   // var HNS0A326_json = [{"ap_name":"HNS0A326AP1","count":"1795","dwellTime":"146694","average":"81.7237"}, {"ap_name":"HNS0A326AP2","count":"2200","dwellTime":"246694","average":"90.7237"}];
    var HNS0A326_json = [ 
    	{"ap_name":"HNSLAB326AP1","count":"4200"},
    	{"ap_name":"HNSLAB326AP2","count":"1256"},
		{"ap_name":"HNSLAB326AP3","count":"3200"},
		{"ap_name":"HNSLAB326AP4","count":"2426"},
		{"ap_name":"HNSLAB326AP5","count":"156"},
		{"ap_name":"HNSLAB326AP6","count":"200"},
		/*{"ap_name":"HNSLAB326AP7","count":"100"},
		{"ap_name":"HNSLAB326AP8","count":"100"},
		{"ap_name":"HNSLAB326AP9","count":"156"},
		{"ap_name":"HNSLAB326AP10","count":"200"},
		{"ap_name":"HNSLAB326AP11","count":"306"},
		{"ap_name":"HNSLAB326AP12","count":"100"},
		{"ap_name":"HNSLAB326AP13","count":"100"},
		{"ap_name":"HNSLAB326AP14","count":"156"},
 		{"ap_name":"HNSLAB326AP15","count":"100"},
 		{"ap_name":"HNSLAB326AP16","count":"100"},
 		{"ap_name":"HNSLAB326AP17","count":"100"},
 		{"ap_name":"HNSLAB326AP18","count":"156"},
 		{"ap_name":"HNSLAB326AP19","count":"200"},
 		{"ap_name":"HNSLAB326AP20","count":"100"},
 		{"ap_name":"HNSLAB326AP21","count":"100"},
 		{"ap_name":"HNSLAB326AP22","count":"100"},
 		{"ap_name":"HNSLAB326AP23","count":"156"},
 		{"ap_name":"HNSLAB326AP24","count":"200"},
 		{"ap_name":"HNSLAB326AP25","count":"100"},
 		{"ap_name":"HNSLAB326AP26","count":"100"},
 		{"ap_name":"HNSLAB326AP27","count":"100"},
 		{"ap_name":"HNSLAB326AP28","count":"100"},
 		{"ap_name":"HNSLAB326AP29","count":"156"},
 		{"ap_name":"HNSLAB326AP30","count":"200"},
 		{"ap_name":"HNSLAB326AP31","count":"100"}*/
	];
    parseAndFillApData('HNS0A326', HNS0A326_json);
}// utCode