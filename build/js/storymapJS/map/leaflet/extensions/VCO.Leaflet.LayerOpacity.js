/*
 * L.Control.LayerOpacity is used for the default zoom buttons on the map.
 */

L.Control.LayerOpacity = L.Control.extend({
	options: {
		position: 'bottomleft',
		zoomInText: '+',
		zoomInTitle: 'Zoom in',
		zoomOutText: '-',
		zoomOutTitle: 'Zoom out'
	},

	initialize: function (layer, options) {
		L.setOptions(this, options);

		this._layer;
		this._layers = {};
		this._container = null;
	},

	onAdd: function () {
		this._initLayout();

		return this._container;		
	},

	_initLayout: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-opacity leaflet-bar');
		this._map = map;

		this._label = L.DomUtil.create('label', 'leaflet-opacity-label', this._container);
		this._label.innerHTML = "Overlay Transparency";

		this._slider = L.DomUtil.create('input', 'leaflet-opacity-slider', this._container);
		this._slider.type = "range";
		this._slider.setAttribute("min", 1);
		this._slider.setAttribute("max", 20);

		this._container.style.display = 'none';

		L.DomEvent
			.on(this._slider, 'change', L.DomEvent.stopPropagation)
			.on(this._slider, 'mousedown', L.DomEvent.stopPropagation)
			.on(this._slider, 'dblclick', L.DomEvent.stopPropagation)
			.on(this._slider, 'change', L.DomEvent.preventDefault)
			.on(this._slider, 'change', this._slideChange, this);
	},

	onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
	},

	_slideChange: function(){
		this._layer.setOpacity((this._slider.value)/20);
	},

	_add: function(layer){
		this._container.style.display = '';
		this._layer = layer;
	},

	_remove: function(layer){
		this._container.style.display = 'none';
		this._layer = null;
	},

	add: function(layer){
		this._add(layer);
	},

	remove: function(layer){
		this._remove(layer);
	}
});

L.control.layeropacity = function (layer, options) {
	return new L.Control.LayerOpacity(layer, options);
};