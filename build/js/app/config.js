var tour = {};

// Name and Locale ID for each language of the site.
// First in list is considered the preferred language.
// Helpful list below:
// http://www.i18nguy.com/unicode/language-identifiers.html

tour.languages = [ 
	{
		name: "English",
		id: "en-gb",
		url: "en"
	},
	{
		name: "Italiano",
		id: "it-it",
		url: "it"
	}
];

// Name of each pages for the site.
// All are neccessary. Do not change unless you know what you're doing.
// First in list is considered the preferred and first loaded tour.

tour.pages = [
	{
		name: "About",
		url: "about",
		title: "About Storytour"
	},
	{
		name: "Tour",
		url: "tour",
		title: "Storytours"
	}
];

tour.maps = [
	{
		name: "Tarraco",
		tourId: "tarraco",
		title: "Tarraco tour",
		language: "",
		maps: [{
			map_type: "",
			map_name: "",
			map_mini: true,
			map_as_image: false, //for zoomify
			calculate_zoom: false, 
			zoomify: {  //for zoomify
					"name": "",
		  			"path": "",
		  			"width": 5200,
		  			"height": 5844,
		  			"tolerance": 0.9,
		  			"attribution": ""
					}
		}],
		overlays: [{
			imageUrl: "",
			imageBounds: "",
			imageOptions: {
				"opacity": "",
				"attribution": ""
			}
		}]
	},
	{
		name: "Puteoli",
		tourId: "puteoli",
		title: "Puteoli tour",
		language: "",
		maps: [{
			map_type: "",
			map_name: "",
			map_mini: true,
			map_as_image: false, //for zoomify
			calculate_zoom: false, 
			zoomify: { //for zoomify
					"name": "",
		  			"path": "",
		  			"width": 5200,
		  			"height": 5844,
		  			"tolerance": 0.9,
		  			"attribution": ""
					}
		}],
		overlays: [{
			imageUrl: "",
			imageBounds: "",
			imageOptions: {
				"opacity": "",
				"attribution": ""
			}
		}]
	}
];

// Translations for each language used in the site.
// First in list is considered the preferred language.
// Copy and paste section below and create new translation. Do not change keys of object.

tour.translations = {
		"en": {
			"TEST_PARAGRAPH": "Hello World",
			"PREFIX": "en",
			"NAME_EN": "English",
			"NAME_ES": "Spanish",			
			"HOME": {
				"TITLE": "",
				"PARAGRAGH": ""
			},
			"ABOUT": {
				"HEADLINE": "",
				"TEXT": ""
			}
		}
};

