/*****************************************************************/
/************************ globals ********************************/
/** ************************************************************** */

var gStoreId, gStoreDateStart, gStoreDateEnd;
var gStoreDropdownMap = new Map();
var gStoreLocationMap = new Map();
var gConfig = {"heatmapLowerbound": 0, 
		       "heatmapUpperbound": 100, 
		       "gradientDensity": {gradient: {0.1: 'lime', 0.7:'yellow',  0.8: 'orange', 1.0: '#E74C3C'}},
	           "gradientOptions": {max: 10 },
	           "heatIntensity":2,	         
	           "coverageIntensity":0.2,	 
	           "mediumStoreApCountMin":5,
	           "mediumStoreApCountMax":8,
	           "lowApCountBucket":{	            	
	               "bucket1":{"apDistanceMin": 0, "apDistanceMax": 15, "gradientBlur": 65, "coverageRadius": 7, "coverageRadiusStep": 13, "coverageAngleStep": 13, "heatRadius": 30, "heatAngleStep": 17},
	 	           "bucket2":{"apDistanceMin": 16, "apDistanceMax": 80, "gradientBlur": 85, "coverageRadius": 9, "coverageRadiusStep": 5, "coverageAngleStep": 5, "heatRadius": 50, "heatAngleStep": 20 },
	 	           "bucket3":{"apDistanceMin": 81, "apDistanceMax": 150, "gradientBlur":64, "coverageRadius": 9, "coverageRadiusStep": 7, "coverageAngleStep": 7, "heatRadius": 80, "heatAngleStep": 20}
	            },
	           "mediumApCountBucket":{
		        	   "bucket1":{"apDistanceMin": 0, "apDistanceMax": 15, "gradientBlur": 65, "coverageRadius": 7, "coverageRadiusStep": 5, "coverageAngleStep": 5, "heatRadius": 30, "heatAngleStep": 17},
		 	           "bucket2":{"apDistanceMin": 16, "apDistanceMax": 80, "gradientBlur": 85, "coverageRadius": 5, "coverageRadiusStep": 9, "coverageAngleStep": 9, "heatRadius": 60, "heatAngleStep": 20 },
		 	           "bucket3":{"apDistanceMin": 81, "apDistanceMax": 150, "gradientBlur":64, "coverageRadius": 9, "coverageRadiusStep": 15, "coverageAngleStep": 15, "heatRadius": 80, "heatAngleStep": 20}
		           },
	           "largeApCountBucket":{
	               "bucket1":{"apDistanceMin": 0, "apDistanceMax": 15, "gradientBlur": 65, "coverageRadius": 7, "coverageRadiusStep": 5, "coverageAngleStep": 5, "heatRadius": 30, "heatAngleStep": 17},
	  	           "bucket2":{"apDistanceMin": 16, "apDistanceMax": 80, "gradientBlur": 85, "coverageRadius": 8, "coverageRadiusStep": 13, "coverageAngleStep": 13, "heatRadius": 50, "heatAngleStep": 20 },
	  	           "bucket3":{"apDistanceMin": 81, "apDistanceMax": 150, "gradientBlur":64, "coverageRadius": 9, "coverageRadiusStep": 15, "coverageAngleStep": 15, "heatRadius": 80, "heatAngleStep": 20}
	            }	           
	           
              };




/** ************************************************************** */
/** ********************** heatmap code ************************** */
/** ************************************************************** */
var gHscFloormap = L.map('hsc_map',{
    attributionControl: false,
    dragging: false,
    crs: L.CRS.Simple,
    minZoom: 2,
    maxZoom: 3,
});
var markerIcon = L.icon({
    iconUrl: './img/map_marker.png',   
    iconSize:     [32, 32], // size of the icon   
    iconAnchor:   [15, 18], // point of the icon which will correspond to marker's location
});


var gHeatmapData = [];
var gFloormapBounds = [[gConfig.heatmapLowerbound, gConfig.heatmapLowerbound], [gConfig.heatmapUpperbound, gConfig.heatmapUpperbound]];
gHscFloormap.fitBounds(gFloormapBounds);
var g_image_layer = L.imageOverlay("", gFloormapBounds);

function removeAllMapLayers() {
    gHscFloormap.eachLayer(function (layer) {
        gHscFloormap.removeLayer(layer);
    });
}// removeAllMapLayers

function applyImageLayer(imageUrl) {
    g_image_layer.setUrl(imageUrl);
    g_image_layer.addTo(gHscFloormap);
}// applyImageLayer

function applyHeatLayer() {
   var apHeatLayer = L.heatLayer();  
    apHeatLayer.setOptions(gConfig.gradientDensity);  
    apHeatLayer.setOptions(gConfig.gradientOptions);
    apHeatLayer.setLatLngs(gHeatmapData);
    apHeatLayer.addTo(gHscFloormap);
}// applyHeatLayer


function drawHeatCircle(x, y, intensity, radiusStart, radiusEnd, radius_steps, angle_step){
	thisApPointsPlotted = 0;
	if( (x <= gConfig.heatmapUpperbound && x >= gConfig.heatmapLowerbound)
			&& (y <= gConfig.heatmapUpperbound && y >= gConfig.heatmapLowerbound)
			&& (radiusEnd <= gConfig.heatmapUpperbound)
			&& (radius_steps > 0) && (angle_step > 0)
			&& (radiusStart >= 0 && radiusStart <= 100) ){
		    for(rad=radiusStart; rad<=radiusEnd; rad+=radius_steps) {	
	         for(angle=1; angle<=360; angle+=angle_step) {
	            tmpX = x + rad * Math.cos(angle);
	            tmpY = y + rad * Math.sin(angle);	           
	            if ((tmpX > gConfig.heatmapUpperbound) || (tmpX < gConfig.heatmapLowerbound) ||
	                (tmpY > gConfig.heatmapUpperbound) || (tmpY < gConfig.heatmapLowerbound)) {
	                continue;
	            }// if
	            gHeatmapData.push([tmpY, tmpX, intensity]);	
	            
	            thisApPointsPlotted++;
	         }// angle	       
	    }// rad
		return thisApPointsPlotted;
	 }
}// drawHeatCircle

function avgDistanceBwAps(storeLocationMap){	
	   var distance = [];
	   var avgDistance;
	    for (var i = 0; i < storeLocationMap.length; i++){
	 	   var x1 = storeLocationMap[i][0];
	 	   var y1 = storeLocationMap[i][1];    	   
	 	   for(var j = i+1; j < storeLocationMap.length; j++ ){
	 		   var x2 = storeLocationMap[j][0]; 
	 		   var y2 = storeLocationMap[j][1];    		   
	 		   var dist = Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2) );
	 		   distance.push(dist);
	 	   }    	  
	   } 	    
	    const reducer = (accumulator, currentValue) => accumulator + currentValue;
	    avgDistance = parseInt(distance.reduce(reducer)/distance.length);
	    return avgDistance;
 } //avgDistanceBwAps


function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "k", "m", "b","t"];
        var suffixNum = Math.floor( (""+value).length/3 );
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
        newValue = shortValue+suffixes[suffixNum];
    }
    return newValue;
}//abbreviateNumber


/** ************************************************************** */
/** ********************** source code *************************** */
/** ************************************************************** */
$(document).ready(function() {	
	if(!sessionStorage.getItem('heatmap_tjx_isLoggedIn')){
		window.location = "login.html";
	}	
    populateStoreDropdown();
    getFromDateToEndDate(gStoreId);	
 
   
});// ready
function configureDateAndData(fromDateToEndDate, selectedDate=""){	
	if(selectedDate != ""){
		 var selectedStoreDateStart = new Date(selectedDate.minDate);
		 var selectedStoreDateEnd = new Date(selectedDate.maxDate);
	}
	 var storeMinDateStart = new Date(fromDateToEndDate.minDate);
	 var storeMaxDateEnd = new Date(fromDateToEndDate.maxDate);	   
		if(storeMinDateStart <= selectedStoreDateStart && storeMaxDateEnd <= selectedStoreDateEnd){	
			gStoreDateStart = selectedDate.minDate;
			gStoreDateEnd =  selectedDate.maxDate;
		}else {
			gStoreDateStart = gStoreDateEnd = fromDateToEndDate.maxDate;
		}
   
	$("#storeDateStart").datepicker({
	    format: 'yyyy-mm-dd',
	    autoclose: true,	   
	}).on('changeDate', function (selected) {
	    gStoreDateStart = moment(selected.date.valueOf()).format('YYYY-MM-DD');
	    $('#storeDateEnd').datepicker('setStartDate', gStoreDateStart);
	    $('#storeDateStart').datepicker('setStartDate', fromDateToEndDate.minDate);
	   
	});

	$("#storeDateEnd").datepicker({
	    format: 'yyyy-mm-dd',
	    autoclose: true,	  
	}).on('changeDate', function (selected) {
		gStoreDateEnd = moment(selected.date.valueOf()).format('YYYY-MM-DD');
	    $('#storeDateStart').datepicker('setEndDate', gStoreDateEnd );
	    $('#storeDateEnd').datepicker('setEndDate', fromDateToEndDate.maxDate );
	});
	
    $('#storeDateStart').datepicker().datepicker('setDate', gStoreDateStart);
    $('#storeDateEnd').datepicker().datepicker('setDate', gStoreDateEnd);
    spinnerLock(false);    
}//configureDateandData


function configureDate(fromDateToEndDate, callbackArg) {	
	//gStoreDateStart = "2018-04-24"; gStoreDateEnd = "2018-04-24"; //ut
    configureDateAndData(fromDateToEndDate);
    getStoreData(gStoreId, gStoreDateStart, gStoreDateEnd);
}//configureDate

function fromDateToEndOfEachStore(fromDateToEndDate, selectedDate){
	 configureDateAndData(fromDateToEndDate, selectedDate);
	 showPopup();   
}//fromDateToEndOfEachStore


function populateStoreDropdown() {
	gStoreDropdownMap.set('TJXM1299', 'Marshalls 1299');
    gStoreDropdownMap.set('TJXH0006', 'HomeSense 6');
   
    var eachOption = "";
    gStoreDropdownMap.forEach(function(item, key, mapObj){
        eachOption += "<option value="+key+">"+item+"</option>";
    });
    $("#storeSelect").html(eachOption);

    gStoreId = $("#storeSelect").val();
   
}// populateStoreDropdown

function showPopup(){
	toastr.info("Click on apply button to change store image");
}//showPopup

$("#storeSelect").change(function () {
	
    gStoreId = $(this).val(); 
    var inputDataOnChange = {		   
		      "storeId": gStoreId
		    };
    var selctedDate = {
    	      "minDate": gStoreDateStart,
    	      "maxDate": gStoreDateEnd,    	     
    	    };
    var urlFromDateToEndDate = new URL (urlTjxMaxMinDate); 
    urlFromDateToEndDate.search = new URLSearchParams(inputDataOnChange);
    fetchData(urlFromDateToEndDate, fromDateToEndOfEachStore, selctedDate);
    
});//onStoreChnage



$("#fetchNewStoreData").click(function fetchNewStoreData(){
    getStoreData(gStoreId, gStoreDateStart, gStoreDateEnd);
});// click


function getStoreData(storeId, storeDateStart, storeDateEnd) {
    //utCode(); return;
	gStoreLocationMap['TJXM1299'] = gApLocationsTJXM1299;
    gStoreLocationMap['TJXH0006'] = gApLocationsTJXH0006;    

    var inputData = {
      "startDate": storeDateStart,
      "endDate": storeDateEnd,
      "storeId": storeId
    };
    
    var url = new URL (urlTjxHeatMapData);
    url.search = new URLSearchParams(inputData);
    fetchData(url, parseAndFillApData, storeId);
}// getStoreData
   
function getFromDateToEndDate(storeId){
	gStoreId = storeId;
	  var inputDataDefault = {		     
		      "storeId": gStoreId
		    };
	var urlDefaultFromDateToEndDate = new URL (urlTjxMaxMinDate); 
	urlDefaultFromDateToEndDate.search = new URLSearchParams(inputDataDefault);
    fetchData(urlDefaultFromDateToEndDate, configureDate, callbackArg="");
}//getFromDateToEndDate

function fetchData(url, callback, callbackArg1=""){
	 spinnerLock(true);
	fetch(url,
   		{
   		    method: "GET",
   		    headers: {    		       
   		        'content-type': 'application/json'
   		      },    		    
   		}).then((resp) => resp.json())
   		 .then(function(outputData){
   	             callback(outputData, callbackArg1);
   		})
   		.catch(error => {console.error('Error:', error); spinnerLock(false) });
}

function parseAndFillApData(apJsonData, storeId) {
    removeAllMapLayers();
    gHeatmapData = [];
    var storeImgUrl = getImageUrlFromStoreId(storeId);   
    try{
        applyImageLayer(storeImgUrl);
    } catch(e) {
        console.error("applyImageLayer exception: "+e);
    }
    
    var totalAp = [];
    var totalCount = 0;
    for (var eachApIndex = 0; eachApIndex < gStoreLocationMap[storeId].length;  eachApIndex++) {
        var thisApCount = parseInt(apJsonData[eachApIndex].footFall);
        totalCount += thisApCount; 
        totalAp.push(apJsonData[eachApIndex]);
    }
    var totalPointsPlotted = 0; 
    var avgDistance = avgDistanceBwAps(gStoreLocationMap[storeId]);
    var options = {};
    var heatRadius, heatAngleStep, coverageRadius, coverageRadiusStep, coverageAngleStep, gradientBlur;
    
    if(totalAp.length < gConfig.mediumStoreApCountMin){
    	    if(avgDistance >= gConfig.lowApCountBucket.bucket1.apDistanceMin && avgDistance <= gConfig.lowApCountBucket.bucket1.apDistanceMax){ 
    	    	options = gConfig.lowApCountBucket.bucket1;
    	    }else if(avgDistance >= gConfig.lowApCountBucket.bucket2.apDistanceMin && avgDistance <= gConfig.lowApCountBucket.bucket2.apDistanceMax){
    	        options = gConfig.lowApCountBucket.bucket2;
    	    }else {
    	    	options = gConfig.lowApCountBucket.bucket3;
    	    }   
    }else if(totalAp.length > gConfig.mediumStoreApCountMax){
    	   if(avgDistance >= gConfig.largeApCountBucket.bucket1.apDistanceMin && avgDistance <= gConfig.largeApCountBucket.bucket1.apDistanceMax){
 	    	options = gConfig.largeApCountBucket.bucket1;
 	       }else if(avgDistance >= gConfig.largeApCountBucket.bucket2.apDistanceMin && avgDistance <= gConfig.largeApCountBucket.bucket2.apDistanceMax){
 	        options = gConfig.largeApCountBucket.bucket2;
 	       }else {
 	    	options = gConfig.largeApCountBucket.bucket3;
 	    }   
    }else{
    	if(totalAp >= gConfig.mediumApCountBucket.bucket1.apDistanceMin && avgDistance <= gConfig.mediumApCountBucket.bucket1.apDistanceMax){
 	    	options = gConfig.mediumApCountBucket.bucket1;
 	       }else if(avgDistance >= gConfig.mediumApCountBucket.bucket2.apDistanceMin && avgDistance <= gConfig.mediumApCountBucket.bucket2.apDistanceMax){
 	        options = gConfig.mediumApCountBucket.bucket2;
 	       }else {
 	    	options = gConfig.mediumApCountBucket.bucket3;
 	    }   
    }  
    
    heatRadius = options.heatRadius;
    heatAngleStep = options.heatAngleStep; 
    coverageRadius = options.coverageRadius;
    coverageRadiusStep = options.coverageRadiusStep;
    coverageAngleStep = options.coverageAngleStep;
    gradientBlur = options.gradientBlur;
    
    gConfig.gradientOptions.radius = heatRadius;  //adding radius in gradient option
    gConfig.gradientOptions.blur = gradientBlur; //adding blur in gradient option
    
    for(var eachApIndex = 0; eachApIndex < gStoreLocationMap[storeId].length;  eachApIndex++){
        var x = gStoreLocationMap[storeId][eachApIndex][1];
        var y = gStoreLocationMap[storeId][eachApIndex][0];       
        var thisApCount = parseInt(apJsonData[eachApIndex].footFall);
        var percentageCount = parseInt((100*thisApCount) / totalCount);
        // higher the percentage, lower the steps. so, lower the steps, more the
		// num of points plotted        
        var heatRadiusSteps = parseInt((100 - percentageCount)/10);
        var thisApPointsPlotted = 0;
        				   // drawHeatCircle(x, y, intensity,                 radiusStart,                     radiusEnd                 radius_steps,     angle_step)
        //this is for heat
        thisApPointsPlotted = drawHeatCircle(x, y, gConfig.heatIntensity,     gConfig.heatmapLowerbound+1,     coverageRadius,          heatRadiusSteps,    heatAngleStep); // ap heat circle
        totalPointsPlotted += thisApPointsPlotted;
        
        //this is for coverage
        thisApPointsPlotted = drawHeatCircle(x, y, gConfig.coverageIntensity, coverageRadius,                 gConfig.heatmapUpperbound, coverageRadiusStep, coverageAngleStep); // ap coverage  circle
        totalPointsPlotted += thisApPointsPlotted; 
        /* tooltip code */
        var avgDwellTime = +(apJsonData[eachApIndex].averageTime/60).toFixed(2); // divide by 60 to convert in minute
        var totalFootFall =  abbreviateNumber(apJsonData[eachApIndex].footFall); // convert footFall number in to abbreviated Number(k, m, b, t)
        var tooltipData = "<b>"+apJsonData[eachApIndex].ap_name+"</b>";       
        tooltipData += "<br> Footfall: "+ totalFootFall;
        // tooltipData += "<br> Total Dwell Time (mins):
		// "+parseInt(apJsonData[eachApIndex].dwellTime * 10 / 60)/10;
        tooltipData += "<br> Average Dwell Time (mins): "+avgDwellTime;
        
       
        var circle = L.circle([y,x], {
                radius: coverageRadius,
                // color: 'green',
                fillOpacity: 0,
                stroke: false,
            }).addTo(gHscFloormap);
        circle.bindTooltip(tooltipData, {sticky: true }).addTo(gHscFloormap);
        
        var marker = L.marker([y, x], {
        	icon: markerIcon,        	
        	}).addTo(gHscFloormap);        
        marker.bindTooltip(tooltipData, {sticky: true }).addTo(gHscFloormap);
        
        
       } // for eachApIndex
   
    spinnerLock(false);
    applyHeatLayer();
}// parseAndFillApData


function getImageUrlFromStoreId(storeId) {	
	return "./img/"+storeId+".png";	
}// getImageUrlFromStoreId


function spinnerLock(toBeLocked) {
    if(toBeLocked == true) {
        $('#spinner').show();       
    } else {
        $('#spinner').hide();
    }
}// spinnerLock