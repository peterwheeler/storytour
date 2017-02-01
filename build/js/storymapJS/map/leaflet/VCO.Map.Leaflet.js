/*	VCO.Map.Leaflet
	Creates a Map using Leaflet
================================================== */

VCO.Map.Leaflet = VCO.Map.extend({

	includes: [VCO.Events],

	/*	Create the Map
	================================================== */
	_createMap: function() {
		this._map = new L.map(this._el.map, {scrollWheelZoom:false, zoomControl:true, attributionControl: true});
		this._map.on("load", this._onMapLoaded, this);


		this._map.on("moveend", this._onMapMoveEnd, this);
		this._map.attributionControl.setPrefix("<a href='http://storymap.knightlab.com/' target='_blank' class='vco-knightlab-brand'><span>&#x25a0;</span> StoryMapJS</a>");

		var map_type_arr = this.options.map_type.split(':');

		// Create Tile Layer
		this._tile_layer = this._createAddTileLayer(this.options.maps[0].map_type, this.options.maps[0]);
		this._tile_layer.on("load", this._onTilesLoaded, this);

		// Add Tile Layer
		this._map.addLayer(this._tile_layer);

		// Add Zoomify Image Layer
		if (this._image_layer) {
			this._map.addLayer(this._image_layer);
		}
		// Create Overall Connection Line
		this._line = this._createLine(this._line);
		this._line.setStyle({color:this.options.line_color_inactive});
		this._addLineToMap(this._line);

		// Create Active Line
		this._line_active = this._createLine(this._line_active);
		this._line_active.setStyle({opacity:1});
		this._addLineToMap(this._line_active);

		if (this.options.map_as_image) {
			this._line_active.setStyle({opacity:0});
			this._line.setStyle({opacity:0});
		}
	},

	/*	Create Mini Map
	================================================== */
	// _createMiniMap: function() {
	// 	if (this.options.map_as_image) {
	// 		this.zoom_min_max.min = 0;
	// 	}

	// 	if (!this.bounds_array) {
	// 		this.bounds_array = this._getAllMarkersBounds(this._markers);
	// 	}

	// 	this._tile_layer_mini = this._createAddTileLayer(this.options.map_type);
	// 	this._mini_map = new L.Control.MiniMap(this._tile_layer_mini, {		
	// 		width: 				150,
	// 		height: 			100,
	// 		position: 			"topleft",
	// 		bounds_array: 		this.bounds_array,
	// 		zoomLevelFixed: 	this.zoom_min_max.min,
	// 		zoomAnimation: 		true,
	// 		aimingRectOptions: 	{
	// 			fillColor: 		"#FFFFFF",
	// 			color: 			"#FFFFFF",
	// 			opacity: 		0.4,
	// 			weight: 		1,
	// 			stroke: 		true
	// 		}
	// 	}).addTo(this._map);

	// 	this._mini_map.getContainer().style.backgroundColor = this.options.map_background_color;
	// },

	/*	Create Background Map
	================================================== */
	_createBackgroundMap: function(tiles) {
		// TODO Check width and height
		trace("CREATE BACKGROUND MAP");
		if (!this._image_layer) {
			// Make Image Layer a Group
			this._image_layer = new L.layerGroup();
			// Add Layer Group to Map
			this._map.addLayer(this._image_layer);

		} else {
			this._image_layer.clearLayers();
		}

		if (tiles) {
			// Create Image Overlay for each tile in the group
			for (x in tiles) {
				var target_tile = tiles[x],
					image = {},
					tile = {
						x: 			0,
						y: 			0,
						url: 		target_tile.src,
						height: 	parseInt(target_tile.style.height.split("px")[0]),
						width: 		parseInt(target_tile.style.width.split("px")[0]),
						pos: {
							start: 	0,
							end: 	0
						}
					};

				if (target_tile.style.left || target_tile.style.top) {
					if (target_tile.style.left) {
						tile.x = parseInt(target_tile.style.left.split("px")[0]);
					}
					if (target_tile.style.top) {
						tile.y = parseInt(target_tile.style.top.split("px")[0]);
					}
				} else if (target_tile.style["-webkit-transform"] || target_tile.style["transform"] || target_tile.style["-ms-transform"]) {
					var t_array;

					if (target_tile.style["-webkit-transform"]) {
						t_array = target_tile.style["-webkit-transform"].split("3d(")[1].split(", 0)")[0].split(", ");
					} else if (target_tile.style["transform"]) {
						t_array = target_tile.style["transform"].split("3d(")[1].split(", 0)")[0].split(", ");
					} else if (target_tile.style["-ms-transform"]) {
						t_array = target_tile.style["-ms-transform"].split("3d(")[1].split(", 0)")[0].split(", ");
					}

					tile.x = parseInt(t_array[0].split("px")[0]);
					tile.y = parseInt(t_array[1].split("px")[0]);
				}


				// If using toner, switch to toner lines
				if (tile.url.match("toner")) {
					//tile.url = tile.url.replace("/toner-lite/","/toner-lines/");
					tile.url = tile.url.replace("/toner-hybrid/","/toner-lines/");
					tile.url = tile.url.replace("/toner/","/toner-background/");
				}

				tile.pos.start 	= this._map.containerPointToLatLng([tile.x, tile.y]);
				tile.pos.end 	= this._map.containerPointToLatLng([tile.x + tile.width, tile.y + tile.height]);

				image = new L.imageOverlay(tile.url, [tile.pos.start, tile.pos.end]);
				this._image_layer.addLayer(image);

			}
		}
	},

	/*	Create Layer Switch
	================================================== */
	_createLayerControl: function() {
		var _layergroup = {};
		var _overlaygroup = {};
		var _newoptions = this.options.maps.slice(1, this.options.maps.length);

		// Add Initialized layer to Layer Control
		_layergroup[this.options.maps[0].map_name] = this._tile_layer;

		// Create Additional Tile layers and add to Layer Control
		for (var i = 0, iLen = _newoptions.length; i < iLen; i++) {
			if(_newoptions[i].map_as_overlay == true){
				_overlaygroup[_newoptions[i].map_name] = this._createAddTileLayer(_newoptions[i].map_type, _newoptions[i]);
				this._map.attributionControl.addAttribution(_newoptions[i].attribution);
			}
			else {
				_layergroup[_newoptions[i].map_name] = this._createAddTileLayer(_newoptions[i].map_type, _newoptions[i]);
				this._map.attributionControl.addAttribution(_newoptions[i].attribution);
			}
		}		

		// Create Layer Control
		this._layer_control = new L.control.customlayers(_layergroup, _overlaygroup);
		
		this._layer_control._map = this._map;

		return this._layer_control.onAdd(this._map);
	},

	_createGeolocation: function(){
		this._geolocator = new L.Control.GeoLocate({});

		this._geolocator._map = this._map;

		return this._geolocator.onAdd(this._map);
	},

	/*	Create Intial Tile Layer and Additional Tile Layers
	================================================== */
	_createAddTileLayer: function(map_type, addoptions) {
		var _addoptions = {},
			_zoomify = {},
			_google = {},
			_addtilelayer = null,
			_map_type_arr = null,
			_attribution_knightlab = "<a href='http://leafletjs.com' title='A JS library for interactive maps'>Leaflet</a> | "

		if (addoptions) {
			_addoptions = addoptions;
		}

		if (map_type) {
			_map_type_arr = map_type.split(':');
		}

			switch(_map_type_arr[0]) {
				case 'mapbox':
					var mapbox_name = _map_type_arr[1] || 'nuknightlab.hif6ioi4';
					_addoptions.subdomains 	= 'abcd';
					_addoptions.attribution 	= _attribution_knightlab + "<div class='mapbox-maplogo'></div><a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox © OpenStreetMap</a>";
					_addtilelayer = new L.TileLayer("https://{s}.tiles.mapbox.com/v2/" + mapbox_name + "/{z}/{x}/{y}.png", _addoptions);
					break;
				case 'stamen':
					_addtilelayer = new L.StamenTileLayer(_map_type_arr[1] || 'toner-lite', _addoptions);
					this._map.getContainer().style.backgroundColor = "#FFFFFF";
					break;
				case 'zoomify':
					_zoomify.width			= _addoptions.zoomify.width;
					_zoomify.height 		= _addoptions.zoomify.height;
					_zoomify.tolerance 		= _addoptions.zoomify.tolerance;
					_zoomify.attribution 	= _attribution_knightlab + _addoptions.zoomify.attribution;
					
					_addtilelayer = new L.tileLayer.zoomify(_addoptions.zoomify.path, _zoomify);
					//this._image_layer = new L.imageOverlay(this.options.maps[0].zoomify.path + "TileGroup0/0-0-0.jpg", _tilelayer.getZoomifyBounds(this._map));
					break;
				case 'mapTiler':
					_addoptions.attribution = _addoptions.attribution;
					_addtilelayer = new L.tileLayer(_addoptions.mapTiler.path + '{z}/{x}/{y}.jpg', {
										errorTileUrl: './images/tiny_icon.png',
										// center: [_addoptions.mapTiler.lat, _addoptions.mapTiler.lon],
										minZoom: _addoptions.mapTiler.minZoom,
										maxZoom: _addoptions.mapTiler.maxZoom
									});
					break;	
				case 'osm':
					_addoptions.subdomains = 'ab';
					_addoptions.attribution = _attribution_knightlab + "© <a target='_blank' href='http://www.openstreetmap.org'>OpenStreetMap</a> and contributors, under an <a target='_blank' href='http://www.openstreetmap.org/copyright'>open license</a>";
					_addtilelayer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', _addoptions); 
					break;
			    case 'google':
			    	_google.type = _addoptions.google.type;
			    	_google.lat = _addoptions.google.lat;
			    	_google.lng =  _addoptions.google.lng;
			    	_google.zoom = _addoptions.google.zoom;
			    	_addtilelayer = new L.Google(_google.type, {center: new L.LatLng(_google.lat, _google.lng), zoom: _google.zoom});
			    case 'bing':
			   		 _addtilelayer = new L.BingLayer('Al6ffGPIYHVSjIKLQU_s5d-d4Jq5vETMRlAX_KpPo1rORJyZ7hbzjZ57CIBPIAHG', {subdomains: [0, 1, 2, 3]});
				case 'http':
				case 'https':
					_addoptions.subdomains = _addoptions.map_subdomains;
					_addtilelayer = new L.TileLayer(_addoptions.map_type, _addoptions);
					break;
			        
				default:
					_addtilelayer = new L.StamenTileLayer('toner', _addoptions);
					break;		
			}
			
			return _addtilelayer;
	},

	/*	Events
	================================================== */
	_onMapMoveEnd: function(e) {

	},

	_onTilesLoaded: function(e) {
		this._createBackgroundMap(e.target._tiles);
		this._tile_layer.off("load", this._onTilesLoaded, this);
	},

	_onMapZoomed:function(e) {
		trace("FIRST ZOOM");
		this._map.off("zoomend", this._onMapZoomed, this);

	},

	_onMapZoom:function(e) {

	},

	/*	Marker
	================================================== */
	_createMarker: function(d) {
		var marker = new VCO.MapMarker.Leaflet(d, this.options);
		marker.on('markerclick', this._onMarkerClick, this);
		this._addMarker(marker);
		this._markers.push(marker);
		marker.marker_number = this._markers.length - 1;
		this.fire("markerAdded", marker);

	},

	_addMarker: function(marker) {
		marker.addTo(this._map);
	},

	_removeMarker: function(marker) {

	},

	_markerOverview: function() {
		var _location, _zoom;
		// Hide Active Line
		this._line_active.setStyle({opacity:0});

		if (this.options.map_type == "zoomify" && this.options.map_as_image) {

			var _center_zoom 	= this._tile_layer.getCenterZoom(this._map);

			_location = _center_zoom.center;

			if (this.options.map_center_offset && this.options.map_center_offset.left != 0 || this.options.map_center_offset.top != 0) {
				_center_zoom.zoom = _center_zoom.zoom - 1;
				_location = this._getMapCenterOffset(_location, _center_zoom.zoom);
			}

			this._map.setView(_location, _center_zoom.zoom, {
				pan:{animate: true, duration: this.options.duration/1000, easeLinearity:.10},
				zoom:{animate: true, duration: this.options.duration/1000, easeLinearity:.10}
			});



		} else {
			this.bounds_array = this._getAllMarkersBounds(this._markers);

			if (this.options.map_center_offset && this.options.map_center_offset.left != 0 || this.options.map_center_offset.top != 0) {
				var the_bounds 	= new L.latLngBounds(this.bounds_array);
				_location 		= the_bounds.getCenter();
				_zoom 			= this._map.getBoundsZoom(the_bounds)

				_location = this._getMapCenterOffset(_location, _zoom - 1);

				this._map.setView(_location, _zoom -1, {
					pan:{animate: true, duration: this.options.duration/1000, easeLinearity:.10},
					zoom:{animate: true, duration: this.options.duration/1000, easeLinearity:.10}
				});


			} else {
				this._map.fitBounds(this.bounds_array, {padding:[15,15]});
			}

		}

		if (this._mini_map) {
			this._mini_map.minimize();
		}

	},

	_getAllMarkersBounds: function(markers_array) {
		var bounds_array = [];
		for (var i = 0; i < markers_array.length; i++) {
			if (markers_array[i].data.real_marker) {
				bounds_array.push( [markers_array[i].data.location.lat, markers_array[i].data.location.lon]);
			}
		};
		return bounds_array;
	},

	_calculateMarkerZooms: function() {
		for (var i = 0; i < this._markers.length; i++) {

			if (this._markers[i].data.location) {
				var marker = this._markers[i],
					prev_marker,
					next_marker,
					marker_location,
					prev_marker_zoom,
					next_marker_zoom,
					calculated_zoom;


				// MARKER LOCATION
				if (marker.data.type && marker.data.type == "overview") {
					marker_location = this._getMapCenter(true);
				} else {
					marker_location = marker.location();
				}
				// PREVIOUS MARKER ZOOM
				if (i > 0 ) {
					prev_marker = this._markers[i-1].location();
				} else {
					prev_marker = this._getMapCenter(true);
				}
				prev_marker_zoom = this._calculateZoomChange(prev_marker, marker_location);

				// NEXT MARKER ZOOM
				if (i < (this._markers.length - 1)) {
					next_marker = this._markers[i+1].location();
				} else {
					next_marker = this._getMapCenter(true);
				}
				next_marker_zoom = this._calculateZoomChange(next_marker, marker_location);


				if (prev_marker_zoom && prev_marker_zoom < next_marker_zoom) {
					calculated_zoom = prev_marker_zoom;
				} else if (next_marker_zoom){
					calculated_zoom = next_marker_zoom;

				} else {
					calculated_zoom = prev_marker_zoom;
				}

				if (this.options.map_center_offset && this.options.map_center_offset.left != 0 || this.options.map_center_offset.top != 0) {
					calculated_zoom = calculated_zoom -1;
				}

				marker.data.location.zoom = calculated_zoom;
			}
		};
	},

	/*	Line
	================================================== */

	_createLine: function(d) {
		return new L.Polyline([], {
			clickable: false,
			color: 		this.options.line_color,
			weight: 	this.options.line_weight,
			opacity: 	this.options.line_opacity,
			dashArray: 	this.options.line_dash,
			lineJoin: 	this.options.line_join,
			className: 	"vco-map-line"
		} );

	},

	_addLineToMap: function(line) {
		this._map.addLayer(line);
	},

	_addToLine: function(line, d) {
		line.addLatLng({lon: d.location.lon, lat: d.location.lat});
	},

	_replaceLines: function(line, array) {
		line.setLatLngs(array);
	},

	/*	Map
	================================================== */
	_panTo: function(loc, animate) {
		this._map.panTo({lat:loc.lat, lon:loc.lon}, {animate: true, duration: this.options.duration/1000, easeLinearity:.10});
	},

	_zoomTo: function(z, animate) {
		this._map.setZoom(z);
	},

	_viewTo: function(loc, opts) {
		var _animate 	= true,
			_duration 	= this.options.duration/1000,
			_zoom 		= this._getMapZoom(),
			_location 	= {lat:loc.lat, lon:loc.lon};

		// Show Active Line
		if (!this.options.map_as_image) {
			this._line_active.setStyle({opacity:1});
		}

		if (loc.zoom) {
			_zoom = loc.zoom;
		}

		// Options
		if (opts) {
			if (opts.duration) {
				if (opts.duration == 0) {
					_animate = false;
				} else {
					_duration = duration;
				}
			}

			if (opts.zoom && this.options.calculate_zoom) {
				_zoom = opts.zoom;
			}
		}

		// OFFSET
		if (this.options.map_center_offset) {
			_location = this._getMapCenterOffset(_location, _zoom);
		}

		this._map.setView(
			_location,
			_zoom,
			{
				pan:{animate: _animate, duration: _duration, easeLinearity:.10},
				zoom:{animate: _animate, duration: _duration, easeLinearity:.10}
			}
		)

		if (this._mini_map && this.options.width > this.options.skinny_size) {
			if ((_zoom - 1) <= this.zoom_min_max.min ) {
				this._mini_map.minimize();
			} else {
				this._mini_map.restore();
				//this._mini_map.updateDisplay(_location, _zoom, _duration);
			}
		}

	},

	_getMapLocation: function(m) {
		return this._map.latLngToContainerPoint(m);
	},

	_getMapZoom: function() {
		return this._map.getZoom();
	},

	_getMapCenter: function(offset) {
		if (offset) {

		}
		return this._map.getCenter();
	},

	_getMapCenterOffset: function(location, zoom) {
		var target_point,
			target_latlng;

		target_point 	= this._map.project(location, zoom).subtract([this.options.map_center_offset.left, this.options.map_center_offset.top]);
		target_latlng 	= this._map.unproject(target_point, zoom);

		return target_latlng;

	},

	_getBoundsZoom: function(origin, destination, correct_for_center) {
		var _origin = origin,
			_padding = [(Math.abs(this.options.map_center_offset.left)*3),(Math.abs(this.options.map_center_offset.top)*3)];


		//_padding = [0,0];
		//_padding = [0,0];
		if (correct_for_center) {
			var _lat = _origin.lat + (_origin.lat - destination.lat)/2,
				_lng = _origin.lng + (_origin.lng - destination.lng)/2;
			_origin = new L.LatLng(_lat, _lng);
		}

		var bounds = new L.LatLngBounds([_origin, destination]);
		if (this.options.less_bounce) {
			return this._map.getBoundsZoom(bounds, false, _padding);
		} else {
			return this._map.getBoundsZoom(bounds, true, _padding);
		}
	},

	_getZoomifyZoom: function() {

	},

	_initialMapLocation: function() {
		this._map.on("zoomend", this._onMapZoomed, this);
	},

	/*	Display
	================================================== */
	_updateMapDisplay: function(animate, d) {
		if (animate) {
			var duration = this.options.duration,
				self = this;

			if (d) {duration = d };
			if (this.timer) {clearTimeout(this.timer)};

			this.timer = setTimeout(function() {
				self._refreshMap();
			}, duration);

		} else {
			if (!this.timer) {
				this._refreshMap();
			};
		}

		if (this._mini_map && this._el.container.offsetWidth < this.options.skinny_size ) {
			this._mini_map.true_hide = true;
			//this._mini_map.minimize();
		} else if (this._mini_map) {
			this._mini_map.true_hide = false;
		}
	},

	_refreshMap: function() {
		if (this._map) {
			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = null;
			};

			this._map.invalidateSize();

			// Check to see if it's an overview
			if (this._markers[this.current_marker].data.type && this._markers[this.current_marker].data.type == "overview") {
				this._markerOverview();
			} else {
				this._viewTo(this._markers[this.current_marker].data.location, {zoom:this._getMapZoom()});
			}
		};
	},

	destroyMap: function(){
		if(this._map){
			this._map = null;
		}
	}
});

/*	Overwrite and customize Leaflet functions
================================================== */
L.Map.include({
	_tryAnimatedPan: function (center, options) {
		var offset = this._getCenterOffset(center)._floor();

		this.panBy(offset, options);

		return true;
	},

	_tryAnimatedZoom: function (center, zoom, options) {
		if (typeof this._animateZoom == "undefined") {
			return false;
		}
		if (this._animatingZoom) { return true; }

		options = options || {};

		// offset is the pixel coords of the zoom origin relative to the current center
		var scale = this.getZoomScale(zoom),
		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale),
			origin = this._getCenterLayerPoint()._add(offset);

		this
		    .fire('movestart')
		    .fire('zoomstart');

		this._animateZoom(center, zoom, origin, scale, null, true);

		return true;
	},

	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
		bounds = L.latLngBounds(bounds);

		var zoom = this.getMinZoom() - (inside ? 1 : 0),
		    minZoom = this.getMinZoom(),
			maxZoom = this.getMaxZoom(),
		    size = this.getSize(),

		    nw = bounds.getNorthWest(),
		    se = bounds.getSouthEast(),

		    zoomNotFound = true,
		    boundsSize,
			zoom_array = [],
			best_zoom = {x:0,y:0},
			smallest_zoom = {},
			final_zoom = 0;

		padding = L.point(padding || [0, 0]);
		size = this.getSize();


		// Calculate Zoom Level Differences
		for (var i = 0; i < maxZoom; i++) {
			zoom++;
			boundsSize = this.project(se, zoom).subtract(this.project(nw, zoom)).add(padding);
			zoom_array.push({
				x:Math.abs(size.x - boundsSize.x),
				y:Math.abs(size.y - boundsSize.y)
			})
		}

		// Determine closest match
		smallest_zoom = zoom_array[0];
		for (var j = 0; j < zoom_array.length; j++) {
			if (zoom_array[j].y <= smallest_zoom.y) {
				smallest_zoom.y = zoom_array[j].y;
				best_zoom.y = j;
			}
			if (zoom_array[j].x <= smallest_zoom.x) {
				smallest_zoom.x = zoom_array[j].x;
				best_zoom.x = j;
			}

		}
		final_zoom = Math.round((best_zoom.y + best_zoom.x) / 2)
		return final_zoom;

	}

});

L.TileLayer.include({
	getTiles: function() {
		return this._tiles;
	}
});
