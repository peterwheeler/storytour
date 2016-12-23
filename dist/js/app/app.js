/* ==================================================

StoryTour Angular Application
Designed and built by Peter Wheeler

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/.

================================================== */

( function(exports, global){
"use strict";

var slideIndex = 0;
var watchID;
var paramVal;
var scopeDiv;
var id;

console.log("Angular is working");

var languageCounter = function() {
    var ids = [];
    var preferredId;
    var langIds;
    var urls = [];
    var preferredUrl;
    var langUrls;

    preferredId = tour.languages[0].id;
    preferredUrl = tour.languages[0].id.split("-")[0];

    if (tour.languages.length > 1) {
        for (var g = 0; g < tour.languages.length; g++) {
            var h = tour.languages[g];
            ids.push(h.id);
            urls.push(h.id.split("-")[0]);
        }
    } else {
        ids.push(tour.languages[0].id);
        urls.push(tour.languages[0].id.split("-")[0]);
    }

    langIds = ids.join("|");
    langUrls = urls.join("|");
    return {
        preferredId: preferredId,
        ids: ids,
        langIds: langIds,
        preferredUrl: preferredUrl,
        urls: urls,
        langUrls: langUrls
    };
}();

console.log(languageCounter);

function rootConfig($stateProvider, $urlRouterProvider, $locationProvider, $translateProvider, $translatePartialLoaderProvider, $urlMatcherFactoryProvider, tmhDynamicLocaleProvider){
    var urlMatcher = $urlMatcherFactoryProvider.compile("/{lang:(?:" + languageCounter.langUrls + ")}/");
    $stateProvider.state("app", {
                    abstract: true,
                    url: urlMatcher,
                    templateUrl: "partials/index.html",
                    controller: "rootCtrl",
                    controllerAs: "root"
                }),
    $stateProvider.state("app.home", {
                    url: "",
                    templateUrl: "partials/home.html"
                }),

    // Redirects and Otherwise //
    $urlRouterProvider.when("/", "/"+ languageCounter.preferredUrl +"/"),
    $urlRouterProvider.otherwise("/404"),
    $locationProvider.html5Mode(true),
    $locationProvider.hashPrefix("!");

    $translatePartialLoaderProvider.addPart('home');
    $translateProvider.useLoader('$translatePartialLoader', {
	  urlTemplate: "/js/angular/i18n/{part}/{lang}.json"
	});

    console.log("Language Loaded");

    $translateProvider.preferredLanguage(languageCounter.preferredId);
    $translateProvider.useLocalStorage();
	// Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy("escaped");
    
    tmhDynamicLocaleProvider.localeLocationPattern("/js/angular/i18n/default/angular-locale_{{locale}}.js");
    tmhDynamicLocaleProvider.defaultLocale(languageCounter.preferredId);
};

// function localeConfig(tmhDynamicLocale){
//     var locales = languageCounter.urls,
//     preferredLocale = languageCounter.preferredUrl;
//     var currentLocale = $translate.proposedLanguage();
//     var setLocale = function (locale) {
//       if (!checkLocaleIsValid(locale)) {
//         console.error('Locale name "' + locale + '" is invalid');
//         return;
//       }
//     };
//     tmhDynamicLocale.set();
// };

function pagesConfig($stateProvider){
   for (var i = 0; i < tour.pages.length; i++) {
        var j = tour.pages[i];
        $stateProvider.state("app." + j.url, {
            url: j.url,
            templateUrl: "partials/" + j.url + ".html",
            controller: j.url + "Ctrl",
            controllerAs: "vm",
            data: {
                pageTitle: j.title
                }
        });
    }
};

function tourConfig(stateHelperProvider){
    stateHelperProvider.state({
        abstract: true,
        name: "app.tour",
        url: "",
        template: "<div maps-directive></div>",
        controller: "tourCtrl",
        controllerAs: "vm",
        children: (function(){
            var tourList = [];
            for (var k = 0; k < tour.maps.length; k++) {
                var l = tour.maps[k];
                tourList.push({name: l.id, url: "tour/" + l.id, controllerAs: "vm", controller: "mapsCtrl"})
            }
            return tourList;
        })()
    });

};

// function tourConfig($stateProvider){
//  $stateProvider.state("app.tour", {
//         // abstract: true,
//         url: "tour",
//         templateUrl: "partials/tour.html",
//         controller: "tourCtrl",
//         controllerAs: "vm"
//         // data: {
//         //     // pageTitle: j.title
//         //     }
//     });
// };

// It can't make the same thing twice
// function mapsConfig($stateProvider, map){
//         $stateProvider.state("app.tour." + map, {
//             url: ":" + map + "?prim&sec&tert",
//             template: '<div maps-directive></div>',
//             controller: "mapsCtrl",
//             controllerAs: "vm",
//             params: {   
//                 id: {squash: true, value: null },
//                 prim: {squash: true, value: null },
//                 sec: {squash: true, value: null },
//                 tert: {squash: true, value: null }
//             },
//             data: {
//                 pageTitle: map
//                 }
//         });
// };

function translateFactory($http, $q){
	return {

	}
};

function mapsFactory($state, $stateParams, $http, $q){
//     var storyslider = new VCO.StorySlider("storytour")
    return {
        $state
    }
};

function mapsService($state, $stateParams, $http, $q){
    VCO.StorySlider("storytour", "json/periodo_2.json")
};

function runCtrl($rootScope, $translate, tmhDynamicLocale, $location, $stateParams, $state){

	var vm = this;

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

		$rootScope.currentLang = $stateParams.lang;
		
		if($rootScope.currentLang){
			for (var i = 0; i < languageCounter.ids.length; i++) {
				var urlCode = languageCounter.ids[i].split("-")[0];
				if(urlCode == $rootScope.currentLang){
					$translate.use(urlCode);
					$translate.refresh();
					tmhDynamicLocale.set(languageCounter.ids[i]);
				}
			}
		}
		else {
			$translate.use(languageCounter.preferredUrl);
			$translate.refresh();
			tmhDynamicLocale.set(languageCounter.preferredId);
		}
		console.log("CurrentLang: " + $rootScope.currentLang, "Use: " + $translate.use(), "Proposed: " + $translate.proposedLanguage(), "Locale: " + tmhDynamicLocale.get());

        console.log($state.get());
    });

    // console.log(VCO);

	$rootScope.$on('$translatePartialLoaderStructureChanged', function () {
		$translate.refresh();
	});
};

function rootCtrl($scope, $window, $log, $locale, localStorageService, $translate, $filter, $state, $rootScope, $location, $stateParams, tmhDynamicLocale) {

    $rootScope.startLang = languageCounter.preferredUrl;
    $rootScope.startLangId = languageCounter.preferredId;

    if (!$rootScope.startLang || tour.languages.length === 0) {
        console.error('There are no languages provided');
    }

    $translate.use($rootScope.startLang);
    tmhDynamicLocale.set($rootScope.startLangId);

    $scope.lang = $stateParams.lang;
    $scope.changeLanguage = function(langKey) {
        $translate.use(langKey);
        console.log("en");
    };
};

function aboutCtrl($scope, $location, $stateParams, $translatePartialLoader, $translate){

	$translatePartialLoader.addPart('about');
	$translate.refresh();
};

function tourCtrl($scope, $location, $stateParams, $translatePartialLoader, $translate){

	$translatePartialLoader.addPart('tour');
	$translate.refresh();
};

function mapsCtrl($scope, $location, $stateParams, $translatePartialLoader, $translate, mapsFactory, mapsService){

	$translatePartialLoader.addPart('maps');
	$translate.refresh();

	$scope.countchange = function(langKey){
		$translate.use(langKey);
		$translate.refresh();
	};

    console.log(mapsService);
};

function mapsDirective(){
        return {
            restrict: 'EA',
            replace: false,
            templateUrl: 'partials/maps.html',
            controllerAs: 'vm',
            controller: function () {
            },
            link: function(scope, element, attrs){
            	scope.storymap_options = {
					script_path: "js",
					width: "100%",
					height: "100%",
					language: "en",
					start_at_slide: 0,
					show_lines: false,
					use_custom_markers: true,			
					show_history_line: false,
					map_background_color: "#ffffff",
					// map config
					map_type: "tileMill",
					map_mini: true,
					map_as_image: false,
					calculate_zoom: false
				};		
				scope.storymap = new VCO.StoryMap("storytour", "json/period_2.json", scope.storymap_options);
            }
        };
};

var appConfig = function(){
    var appName = "StoryTour",
    appDependencies = ["additionalViews", "ui.router", "ui.router.stateHelper", "LocalStorageModule", "pascalprecht.translate", "tmh.dynamicLocale", "ngSanitize", "ngAnimate", "ngCookies"],

    pushLateModules = function(lateModule, dependencies) {
        angular.module(lateModule, dependencies || []),
        angular.module(appName).requires.push(lateModule);
        };

    return {
        appName: appName,
        appDependencies: appDependencies,
        pushLateModules: pushLateModules
    };
}();

angular.module("additionalViews", []),
angular.module(appConfig.appName, appConfig.appDependencies),
angular.module(appConfig.appName).config(rootConfig),
rootConfig.$inject = ["$stateProvider", "$urlRouterProvider", "$locationProvider", "$translateProvider", "$translatePartialLoaderProvider", "$urlMatcherFactoryProvider", "tmhDynamicLocaleProvider"],

// appConfig.pushLateModules("StoryTour.localeConfig"),
// angular.module("StoryTour.localeConfig").config(localeConfig),
// localeConfig.$inject = ["tmhDynamicLocale"],

appConfig.pushLateModules(appConfig.appName + ".pages"),
angular.module(appConfig.appName + ".pages").config(pagesConfig),
pagesConfig.$inject = ["$stateProvider"],

appConfig.pushLateModules(appConfig.appName + ".tour"),
angular.module(appConfig.appName + ".tour").config(tourConfig),
tourConfig.$inject = ["stateHelperProvider"];

console.log(appConfig.appDependencies);

angular.module(appConfig.appName).factory("translateFactory", translateFactory),
translateFactory.$inject = ["$http", "$q"],

angular.module(appConfig.appName + ".tour").factory("mapsFactory", mapsFactory),
mapsFactory.$inject = ["$state", "$stateParams", "$http", "$q"],

angular.module(appConfig.appName + ".tour").service("mapsService", mapsService),
mapsService.$inject = ["$state", "$stateParams", "$http", "$q"],

angular.module(appConfig.appName).run(runCtrl),
runCtrl.$inject = ["$rootScope", "$translate", "tmhDynamicLocale", "$location", "$stateParams", "$state"]

angular.module(appConfig.appName).controller("rootCtrl", rootCtrl),
rootCtrl.$inject = ["$scope", "$window", "$log", "$locale", "localStorageService", "$translate", "$filter", "$state", "$rootScope", "$location", "$stateParams", "tmhDynamicLocale"],

angular.module(appConfig.appName + ".pages").controller("aboutCtrl", aboutCtrl),
aboutCtrl.$inject = ["$scope", "$location", "$stateParams", "$translatePartialLoader", "$translate"],

angular.module(appConfig.appName + ".tour").controller("tourCtrl", tourCtrl),
tourCtrl.$inject = ["$scope", "$location", "$stateParams", "$translatePartialLoader", "$translate"],

angular.module(appConfig.appName + ".tour").controller("mapsCtrl", mapsCtrl),
mapsCtrl.$inject = ["$scope", "$location", "$stateParams", "$translatePartialLoader", "$translate", "mapsFactory", "mapsService"],

angular.module(appConfig.appName + ".tour").directive("mapsDirective", mapsDirective)

}({VCO}, function() {return this;}() ),

angular.module("additionalViews").run(["$templateCache", function($templateCache){
    $templateCache.put("navigation.html", '<div class="st-sidebar-wrapper"><div class="st-sidebar"></div><div class="trapezoid"></div></div>'),$templateCache.put("navShell.html", '<div ui-directive></div>');
}])

);
