// 2012 by Thomas netAction Schmidt

function drawHochschulenMap() {
	// change id of map DIV element here
	var mapid = 'map';
	// change base directory to markers (pins) here
	var markerPath = 'lib/images/';

	// Should the page have any map?
	if ($('#'+mapid).length == 0) return;

	// Calculate percentage of Drittmittel for every Bundesland
	// (not used)
	function generateBundeslaender() {
		var laender = {};
		$(hochschulen).each(function(i,hochschule){
			if (laender[hochschule[5]]===undefined) {
				laender[hochschule[5]] = {
					wirtschaft:0,
					gesamt:0,
					quotient:0
				};
			}
			if (hochschule[1]) {
				laender[hochschule[5]].wirtschaft+=hochschule[2];
				laender[hochschule[5]].gesamt+=hochschule[2]/(hochschule[1]/100);
				laender[hochschule[5]].quotient = 
						laender[hochschule[5]].wirtschaft/
						laender[hochschule[5]].gesamt
			}
		});

		// fix typo in data:
		laender['Schleswig-Holstein']=laender['Schleswig-Holtstein'];
		L.geoJson(geoJson,{style:function(feature) {
			console.log((laender[feature.properties.NAME_1].quotient-0.1)*4);
			return {
				fillColor: '#ff0000',
				weight: 1,
				opacity: 1,
				color: 'white',
				fillOpacity: (laender[feature.properties.NAME_1].quotient-0.1)*4
			};
		}}).addTo(map);
	}
	// generateBundeslaender();


	// Create an object that contains all markers (pins) we need
	function generateMarkers() {
		var markers={
			small:{},
			medium:{},
			big:{}
		};
		for (var i=0;i<=100;i+=10) {
			markers.big[i+'%'] = new L.Icon({
				iconUrl:markerPath+'big/marker-icon-'+i+'.png',
				shadowUrl:markerPath+'big/marker-shadow.png',
				iconSize: new L.Point(25, 41),
				iconAnchor: new L.Point(13, 41),
				popupAnchor: new L.Point(1, -34),
				shadowSize: new L.Point(41, 41)
			});
		}
		markers.big['unknown'] = new L.Icon({
			iconUrl:markerPath+'big/marker-icon-unknown.png',
			shadowUrl:markerPath+'big/marker-shadow.png',
			iconSize: new L.Point(25, 41),
			iconAnchor: new L.Point(13, 41),
			popupAnchor: new L.Point(1, -34),
			shadowSize: new L.Point(41, 41)
		});

		for (var i=0;i<=100;i+=10) {
			markers.medium[i+'%'] = new L.Icon({
				iconUrl:markerPath+'medium/marker-icon-'+i+'.png',
				shadowUrl:markerPath+'medium/marker-shadow.png',
				iconSize: new L.Point(15, 24),
				iconAnchor: new L.Point(8, 24),
				popupAnchor: new L.Point(1, -20),
				shadowSize: new L.Point(24, 24)
			});
		}
		markers.medium['unknown'] = new L.Icon({
			iconUrl:markerPath+'medium/marker-icon-unknown.png',
			shadowUrl:markerPath+'medium/marker-shadow.png',
			iconSize: new L.Point(15, 24),
			iconAnchor: new L.Point(8, 24),
			popupAnchor: new L.Point(1, -20),
			shadowSize: new L.Point(24, 24)
		});

		for (var i=0;i<=100;i+=10) {
			markers.small[i+'%'] = new L.Icon({
				iconUrl:markerPath+'small/marker-icon-'+i+'.png',
				shadowUrl:markerPath+'small/marker-shadow.png',
				iconSize: new L.Point(10, 16),
				iconAnchor: new L.Point(5, 15),
				popupAnchor: new L.Point(1, -13),
				shadowSize: new L.Point(16, 16)
			});
		}
		markers.small['unknown'] = new L.Icon({
			iconUrl:markerPath+'small/marker-icon-unknown.png',
			shadowUrl:markerPath+'small/marker-shadow.png',
			iconSize: new L.Point(10, 16),
			iconAnchor: new L.Point(5, 15),
			popupAnchor: new L.Point(1, -13),
			shadowSize: new L.Point(16, 16)
		});
		return markers;
	}
	markers = generateMarkers();

	// generate the marker and popup for a single Hochschule
	// gesamt=true for red/blue pins or false for red only
	function generateLayer(gesamt,hochschule) {
		if (hochschule[1]==0) { // amount unknown
			var marker = markers['medium']['unknown'];
		} else { // amount known
			if (gesamt) {
				// Das gesamte Geld der Hochschule ist Drittmittel durch
				// Drittmittel-Prozentsatz
				var gesamtGeld = hochschule[2]/(hochschule[1]/100);

				// Grenzen, bei denen der Marker wächst
				if (gesamtGeld > 100000000) var size = 'big';
					else if (gesamtGeld > 1000000) var size = 'medium';
					else size = 'small';

				// Grenzen, bei denen der Rotanteil im Marker wächst
				if (hochschule[1]< 5) var marker = markers[size]['0%'];
				else if (hochschule[1]<9) var marker = markers[size]['10%'];
				else if (hochschule[1]<17) var marker = markers[size]['20%'];
				else if (hochschule[1]<27) var marker = markers[size]['30%'];
				else if (hochschule[1]<37) var marker = markers[size]['40%'];
				else if (hochschule[1]<47) var marker = markers[size]['50%'];
				else if (hochschule[1]<57) var marker = markers[size]['60%'];
				else if (hochschule[1]<67) var marker = markers[size]['70%'];
				else if (hochschule[1]<79) var marker = markers[size]['80%'];
				else if (hochschule[1]<90) var marker = markers[size]['90%'];
				else var marker = markers[size]['100%'];
			} else {
				// Größe der Hochschule nur abhaengig von Drittmittelmenge
				if (hochschule[2] > 20000000) var size = 'big';
					else if (hochschule[2] > 1000000) var size = 'medium';
					else size = 'small';

				// immer roter Marker
				marker = markers[size]['100%'];
			}
		}

		// URL des Wiki-Artikels der Hochschule
		var hochschulLink = "https://www.hochschulwatch.de/wiki/"+
			encodeURIComponent(hochschule[0].replace(/ /g,'_'))
				.replace(/\%2F/g,'/');

		// generate popup texts
		if (hochschule[1]==0)	{ // amount unknown
			var markerText =
			'<p><a href="'+hochschulLink+'"><strong>'+hochschule[0]+'</strong></a></p>'+
			'<p>Anteil gewerblicher Wirtschaft unbekannt</p>';
		} else { // amount known
			var amount = Math.round(hochschule[2]);
			amount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
			var percent = Math.round(hochschule[1]);
			var markerText =
			'<p style="margin-bottom:10px;">'+
				'<a href="'+hochschulLink+'"><strong>'+hochschule[0]+'</strong></a>'+
			'</p>'+
			'<p style="margin:0;">'+
				'Drittmitteleinnahmen aus der gewerblichen Wirtschaft: '+amount+' € (am gesamten Drittmittelbudget: '+percent+' %)'+
			'</p>'+
			'<p style="margin-top:3px;">(Stand: 2010, Statistisches Bundesamt)</p>'
		}
		marker = L.marker([hochschule[3], hochschule[4]], {'icon':marker})
			.bindPopup(markerText);
		marker.traeger=hochschule[6];
		marker.hochschulart=hochschule[7];
		marker.gesamt=gesamt;
		return marker;
	}

	// list of all markers and popups
	var layers = [];
	// list of markers to start with
	var startLayers = [];

	var tragerListe = [];
	var hochschulartListe = [];

	// iterate Hochschulen
	$(hochschulen).each(function(index,hochschule){
		var marker = generateLayer(false,hochschule);
		layers.push(marker);

		var marker = generateLayer(true,hochschule);
		layers.push(marker);
		startLayers.push(marker);

		// Add traeger and hochschulart to their arrays
		if(tragerListe.indexOf(hochschule[6]) == -1)
			tragerListe.push(hochschule[6]);
		if(hochschulartListe.indexOf(hochschule[7]) == -1)
			hochschulartListe.push(hochschule[7]);
	});


	// Generate map
	var map = L.map(mapid)
		.setView([0,0],1)
		.fitBounds([ // Germany
			[55.166319,5.778809],
			[47.144897,15.095215]
		]);
	// http://otile1-s.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png
	// http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png
	L.tileLayer('https://otile1-s.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
		attribution: 'OpenStreetMap Tiles CC-BY-SA – Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> – Realisiert von <a href="http://www.opendatacity.de/">OpenDataCity</a>',
		maxZoom: 15
	}).addTo(map);
	map.attributionControl.setPrefix('');


	// Add layer control box
	L.control.layers({},{},{
		position:'topright'
//		collapsed:false
	}).addTo(map);

	$('.leaflet-control-layers-list').html(
		'<p style="font-weight:bold; margin-bottom:0;">Drittmittel aus gewerblicher Wirtschaft</p>'+
		'<label><input type="radio" name="gesamt" value="gesamt" checked="checked">in % am gesamten Drittmitteletat</label>'+
		'<label><input type="radio" name="gesamt" value="drittmittel">in absoluten Zahlen</label>'+
		'<p style="font-weight:bold; margin-bottom:0;">Hochschulart</p><div id="hochschulartInput"></div>'+
		'<p style="font-weight:bold; margin-bottom:0;">Hochschulträger</p><div id="hochschultraegerInput"></div>');

	// Fill layer control box with input elements
	$(tragerListe).each(function(i,traeger){
		$('#hochschultraegerInput')
			.append('<label><input type="checkbox" checked="checked" name="traeger" value="'+traeger.replace(/\s+/g, '')+'">'+traeger+'</label>');
	});
	$(hochschulartListe).each(function(i,hochschulart){
		$('#hochschulartInput')
			.append('<label><input type="checkbox" checked="checked" name="hochschulart" value="'+hochschulart.replace(/\s+/g, '')+'">'+hochschulart+'</label>');
	});

	var layerGroup = L.layerGroup(startLayers).addTo(map);
	$('.leaflet-control-layers-list input').change(function() {
		layerGroup.clearLayers();
		var gesamt = ($('input[name=gesamt]:checked').val()=='gesamt') ? true : false;
		$(layers).each(function(i,layer) {
			if (
				(layer.gesamt==gesamt) &&
				($('#hochschultraegerInput input[value='+layer.traeger.replace(/\s+/g, '')+']').attr('checked')) &&
				($('#hochschulartInput input[value='+layer.hochschulart.replace(/\s+/g, '')+']').attr('checked'))
			) layerGroup.addLayer(layer);
		});
	});

}

jQuery(function($) {
	drawHochschulenMap();
});
