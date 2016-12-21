VCO.ModalMessage = VCO.Class.extend({
	
	includes: [VCO.Events, VCO.DomMixins],
	
	_el: {},

	/*	Constructor
	================================================== */
	initialize: function(data, options, add_to_container) {
		// DOM ELEMENTS
		this._el = {
			container: {},
			message_container: {},
			message: {}
		};
	
		//Options
		this.options = {
			message_class: 			"vco-message",
			message_id:             "",
			message_open:           false, 
			message_type: 			"", 
		};
		
		// Merge Data and Options
		VCO.Util.mergeData(this.data, data);
		VCO.Util.mergeData(this.options, options);
		
		this._el.container = VCO.Dom.create("div", "modal");
		this._el.container.id = this.options.message_id;
		
		if (add_to_container) {
			add_to_container.appendChild(this._el.container);
			this._el.parent = add_to_container;
		};
		
		
		// Animation
		this.animator = {};
		
		this._initLayout();
		this._initEvents();
	},

	/*	Public
	================================================== */
	updateMessage: function(t) {
		this._updateMessage(t);
	},

	updateMessageOpen: function(e){
		this._updateMessageOpen(e);
	},

	/*	Update Display
	================================================== */
	updateDisplay: function(w, h) {
		this._updateDisplay(w, h);
	},
	
	_updateMessage: function(t) {
		if (!t) {
			if (VCO.Language) {
				this._el.message.innerHTML = VCO.Language.messages.loading;
			} else {
				this._el.message.innerHTML = "Loading";
			}
		} else {
			this._el.message.innerHTML = t;
		}
	},

	_updateMessageOpen: function(e){
		this.options.message_open == e;
	},

	/*	Events
	================================================== */

	
	_onMouseClick: function() {
		this.fire("clicked", this.options);
	},

	
	/*	Private Methods
	================================================== */
	_initLayout: function () {
		
		// Create Layout
		this._el.message_container = VCO.Dom.create("div", "modal-content", this._el.container);
		this._el.message = VCO.Dom.create("div", "vco-message-content", this._el.message_container);
		
		this._updateMessage();
		
	},
	
	_initEvents: function () {
		VCO.DomEvent.addListener(this._el.container, 'click', this._onMouseClick, this);
	}

});