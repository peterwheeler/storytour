var tour = {};

// Name and Locale ID for each language of the site.
// First in list is considered the preferred language.
// Helpful list below:
// http://www.i18nguy.com/unicode/language-identifiers.html

tour.languages = [ 
	{
		name: "English",
		id: "en-gb"
	},
	{
		name: "Español",
		id: "es-es",
	},
	{
		name: "Italiano",
		id: "it-it",
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
		name: "Team",
		url: "team",
		title: "Storytours Team"
	}
];

tour.maps = [
	{
		name: "Tarraco",
		id: "tarraco", // Used as url
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
		id: "puteoli",
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

