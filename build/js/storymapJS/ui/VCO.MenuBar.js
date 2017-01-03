/*	VCO.MenuBar
	Draggable component to control size
================================================== */
 
VCO.MenuBar = VCO.Class.extend({
	
	includes: [VCO.Events, VCO.DomMixins],
	
	_el: {},
	
	/*	Constructor
	================================================== */
	initialize: function(elem, parent_elem, options) {
		// DOM ELEMENTS
		this._el = {
			parent: {},
			container: {},
			button_logo: {},
			button_container: {},
			button_overview: {},
			button_backtostart: {},
			button_collapse_toggle: {},
			button_layers_toggle: {},
			button_layers: {},
			control_layer: {},
			arrow: {},
			line: {},
			coverbar: {},
			grip: {}
		};

		this.el = this._el;
		
		this.collapsed = false;
		
		if (typeof elem === 'object') {
			this._el.container = elem;
		} else {
			this._el.container = VCO.Dom.get(elem);
		}
		
		if (parent_elem) {
			this._el.parent = parent_elem;
		}
	
		//Options
		this.options = {
			width: 					600,
			height: 				600,
			duration: 				1000,
			ease: 					VCO.Ease.easeInOutQuint,
			menubar_default_y: 		0
		};
		
		// Animation
		this.animator = {};
		
		// Merge Data and Options
		VCO.Util.mergeData(this.options, options);
		
		this._initLayout();
		this._initEvents();
	},
	
	/*	Public
	================================================== */
	show: function(d) {
		var duration = this.options.duration;
		if (d) {
			duration = d;
		}
	},
	
	hide: function(top) {
	},
		
	
	setSticky: function(y) {
		this.options.menubar_default_y = y;
	},
	
	/*	Color
	================================================== */
	setColor: function(inverted) {
		if (inverted) {
			this._el.container.className = 'vco-menubar vco-menubar-inverted';
		} else {
			this._el.container.className = 'vco-menubar';
		}
	},
	
	/*	Update Display
	================================================== */
	updateDisplay: function(w, h, a, l) {
		this._updateDisplay(w, h, a, l);
	},

	/*	Events
	================================================== */

	
	_onButtonOverview: function(e) {
		this.fire("overview", e);
	},
	
	_onButtonBackToStart: function(e) {
		this.fire("back_to_start", e);
	},

	_onButtonLayers: function(e) {
		this.fire("layers", e);
	},
	
	_onButtonCollapseMap: function(e) {
		if (this.collapsed) {
			this.collapsed = false;
			this.show();

			this._el.button_overview.style.color = "grey";
			this._el.button_layers.style.color = "grey";
			this._el.button_backtostart.style.color = "#333";

			this.fire("collapse", {y:this.options.menubar_default_y});

			if (this._el.button_collapse_toggle.title == VCO.Language.buttons.uncollapse_toggle) {
				this._el.button_collapse_toggle.innerHTML	= "<i class='fa fa-align-left fa-lg'></i>";
				this._el.button_collapse_toggle.title = VCO.Language.buttons.collapse_toggle;
			}
			else {
				this._el.button_collapse_toggle.innerHTML	= "<i class='fa fa-map-o fa-lg'></i>";		
				this._el.button_collapse_toggle.title = VCO.Language.buttons.uncollapse_toggle;
			}
	
		} else {
			this.collapsed = true;
			this.hide(25);

			this._el.button_overview.style.color = "#333";
			this._el.button_layers.style.color = "#333";
			this._el.button_backtostart.style.color = "grey";

			this.fire("collapse", {y:1});

			if (this._el.button_collapse_toggle.title == VCO.Language.buttons.uncollapse_toggle) {
				this._el.button_collapse_toggle.innerHTML	= "<i class='fa fa-align-left fa-lg'></i>";
				this._el.button_collapse_toggle.title = VCO.Language.buttons.collapse_toggle;
			}
			else {
				this._el.button_collapse_toggle.innerHTML	= "<i class='fa fa-map-o fa-lg'></i>";		
				this._el.button_collapse_toggle.title = VCO.Language.buttons.uncollapse_toggle;
			}

		}
	},

	_collapseButtonToggle: function(e) {
        if (this.collapsed) {
            this.collapsed = false;
            this.show();

            this._el.button_overview.style.color = "grey";
			this._el.button_layers.style.color = "grey";
			this._el.button_backtostart.style.color = "#333";

			if (this._el.button_collapse_toggle.title == VCO.Language.buttons.uncollapse_toggle) {
				this._el.button_collapse_toggle.innerHTML	= "<i class='fa fa-align-left fa-lg'></i>";
				this._el.button_collapse_toggle.title = VCO.Language.buttons.collapse_toggle;
			}
			else {
				this._el.button_collapse_toggle.innerHTML	= "<i class='fa fa-map-o fa-lg'></i>";		
				this._el.button_collapse_toggle.title = VCO.Language.buttons.uncollapse_toggle;
			}

        } else {
            this.collapsed = true;
            this.hide(25);

            this._el.button_overview.style.color = "#333";
			this._el.button_layers.style.color = "#333";
			this._el.button_backtostart.style.color = "grey";

			if (this._el.button_collapse_toggle.title == VCO.Language.buttons.uncollapse_toggle) {
				this._el.button_collapse_toggle.innerHTML	= "<i class='fa fa-align-left fa-lg'></i>";
				this._el.button_collapse_toggle.title = VCO.Language.buttons.collapse_toggle;
			}
			else {
				this._el.button_collapse_toggle.innerHTML	= "<i class='fa fa-map-o fa-lg'></i>";		
				this._el.button_collapse_toggle.title = VCO.Language.buttons.uncollapse_toggle;
			}
        }
    },
	
	/*	Private Methods
	================================================== */
	_initLayout: function () {
		// Create Layout

		this._el.button_container = VCO.Dom.create('div', 'buttons-container', this._el.container);
		this._el.buttons_header = VCO.Dom.create('div', 'buttons-header', this._el.button_container);
		this._el.buttons_header.innerHTML = '<div class="close-slide-out"><a ng-href="#" data-activates="slide-out" class="show-on-small"><i class="material-icons new-medium right">&#xE314;</i></a></div><div class="menu-header"><h3>Settings</h3></div><li style="padding: 0px;"><div class="divider" style="margin: 0px;"></div></li>';

		// this._el.button_collapse_toggle = VCO.Dom.create('li', 'bold', this._el.button_container);
		// this._el.button_collapse_toggle.innerHTML = '<a class="collapsible-header waves-effect"><i class="material-icons">cloud</i>Switch Story/Maps</a>';
		// VCO.DomEvent.addListener(this._el.button_collapse_toggle, 'click', this._onButtonCollapseMap, this);

		this._el.button_overview = VCO.Dom.create('li', 'bold', this._el.button_container);
		this._el.button_overview.innerHTML = '<a ng-href="#!" class="collapsible-header waves-effect"><i class="material-icons">&#xE56B;</i>' + VCO.Language.buttons.overview + '</a>';
		VCO.DomEvent.addListener(this._el.button_overview, 'click', this._onButtonOverview, this);

		this._el.button_backtostart = VCO.Dom.create('li', 'bold', this._el.button_container);
		this._el.button_backtostart.innerHTML = '<a ng-href="#!" class="collapsible-header waves-effect"><i class="material-icons">&#xE166;</i>' + VCO.Language.buttons.backtostart + '</a>';
		VCO.DomEvent.addListener(this._el.button_backtostart, 'click', this._onButtonBackToStart, this);

		this._el.button_geolocation = VCO.Dom.create('li', 'bold', this._el.button_container);
		// this._el.button_geolocation.innerHTML = '<a class="collapsible-header waves-effect switch"><i class="material-icons">location_on</i>Geolocation<label><input type="checkbox"><span class="lever"></span></label></a>';
		// VCO.DomEvent.addListener(this._el.button_collapse_toggle, 'click', this._onButtonCollapseMap, this);

		this._el.button_layers = VCO.Dom.create('ul', 'collapsible collapsible-menubar collapsible-accordion', this._el.button_container);
		VCO.DomEvent.addListener(this._el.button_layers, 'click', this._onButtonLayers, this);
	},

	_initEvents: function () {
	},
	
	// Update Display
	_updateDisplay: function(width, height, animate) {
		
		if (width) {
			this.options.width = width;
		}
		if (height) {
			this.options.height = height;
		}
	},

	/*	Public
	================================================== */

	collapseButtonToggle: function () {
		this._collapseButtonToggle();
	},

	controlLayers: function (layers) {
		this._el.button_layers.appendChild(layers);
	},

	geolocationLayer: function(layer) {
		this._el.button_container.appendChild(layer)
	}
	
});