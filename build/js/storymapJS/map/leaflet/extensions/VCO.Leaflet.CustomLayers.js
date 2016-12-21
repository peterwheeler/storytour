/*
 * L.Control.CustomLayers is a control to allow users to switch between different layers on the map.
 */

L.Control.CustomLayers = L.Control.extend({
	options: {
		collapsed: true,
		position: 'topright',
		autoZIndex: true,
		hideSingleBase: false
	},

	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);

		this._layers = {};
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true);
		}
	},

	onAdd: function () {
		this._initLayout();
		this._update();

		return this._container;
	},

	addBaseLayer: function (layer, name) {
		this._addLayer(layer, name);
		return this._update();
	},

	addOverlay: function (layer, name) {``
		this._addLayer(layer, name, true);
		return this._update();
	},

	removeLayer: function (layer) {
		layer.off('add remove', this._onLayerChange, this);

		delete this._layers[L.stamp(layer)];
		return this._update();
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('li', 'bold active');

		var link = this._layersLink = L.DomUtil.create('a', 'active collapsible-header waves-effect waves-teal', container);
		link.innerHTML = '<i class="material-icons left">&#xE53B;</i>Layers'

		this._layersList = this._form = L.DomUtil.create('div', 'collapsible-body', container);
		this._form = L.DomUtil.create('ul', '', this._layersList);
		this._baseLayersList = L.DomUtil.create('form', 'baselayers', this._form);
		this._baseLayersList.innerHTML = '<li style="padding: 0px;"><div class="divider" style="margin: 0px;"></div></li><li><a class="subheader">Baselayers</a></li>';
		this._overlaysList = L.DomUtil.create('div', 'overlays', this._form);
		this._overlaysList.innerHTML = '<li style="padding: 0px;"><div class="divider" style="margin: 0px;"></div></li><li><a class="subheader">Overlays</a></li>'

		// L.DomEvent.on(this._layersList, 'click', this._collapse, this);
	},

	_addLayer: function (layer, name, overlay) {
		//layer.on('add remove', this._onLayerChange, this);

		var id = L.stamp(layer);

		this._layers[id] = {
			layer: layer,
			name: name,
			overlay: overlay
		};

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}
	},

	_update: function () {
		if (!this._container) { return this; }

		var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;

		for (i in this._layers) {
			obj = this._layers[i];
			this._addItem(obj);
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
			baseLayersCount += !obj.overlay ? 1 : 0;
		}

		// Hide base layers section if there's only one layer.
		if (this.options.hideSingleBase) {
			baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
			this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
		}

		if(overlaysPresent) {
			this._layerOpacity = new L.control.layeropacity().addTo(this._map);
		}

		return this;
	},

	_onLayerChange: function (e) {
		if (!this._handlingClick) {
			this._update();
		}

		var overlay = this._layers[L.stamp(e.target)].overlay;

		var type = overlay ?
			(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'add' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, e.target);
		}
	},

	_hasClass: function (el, cls) {
  		return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, id, checked) {

		var radioHtml = '<input type="radio" class="with-gap" id="radio' + id + '" name="' +
				name + '"' + (checked ? ' checked="checked"' : '') + '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj) {
		var label = document.createElement('li'),
			name = document.createElement('label'),
		    checked = this._map.hasLayer(obj.layer),
		    layerId = L.stamp(obj.layer),
		    input;

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.layerId = layerId
			input.id = 'checkbox' + input.layerId;
			input.className = 'filled-in';
			input.defaultChecked = checked;
			name.setAttribute('for', 'checkbox' + input.layerId);
		} else {
			input = this._createRadioElement('leaflet-base-layers', layerId, checked);
			input.layerId = layerId
			name.setAttribute('for', 'radio' + input.layerId);
		}

		name.innerHTML = ' ' + obj.name;

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		label.appendChild(input);
		label.appendChild(name);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);

		return label;
	},

	_onInputClick: function () {
		var inputs = this._form.getElementsByTagName('input'),
		    input, layer, hasLayer;
		var addedLayers = [],
		    removedLayers = [];

		this._handlingClick = true;

		for (var i = 0, len = inputs.length; i < len; i++) {
			input = inputs[i];
			layer = this._layers[input.layerId].layer;
			hasLayer = this._map.hasLayer(layer);

			if (input.checked && !hasLayer && input.type == 'checkbox') {
				addedLayers.push(layer);
				this._layerOpacity.add(layer);
			} else if (input.checked && !hasLayer){
				addedLayers.push(layer);	
			} else if (!input.checked && hasLayer && input.type == 'checkbox') {
				removedLayers.push(layer);
				this._layerOpacity.remove(layer);
			} else if (!input.checked && hasLayer){
				removedLayers.push(layer);

			}
		}

		// Bugfix issue 2318: Should remove all old layers before readding new ones
		for (i = 0; i < removedLayers.length; i++) {
			this._map.removeLayer(removedLayers[i]);
		}
		for (i = 0; i < addedLayers.length; i++) {
			this._map.addLayer(addedLayers[i]);
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'open');
	},

	_collapse: function () {
		L.DomUtil.removeClass(this._container, 'open');
	}
});

L.control.customlayers = function (baseLayers, overlays, options) {
	return new L.Control.CustomLayers(baseLayers, overlays, options);
};