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

var languageCounter = function() {
    var ids = [],
    locales = [],
    preferredLocale,
    langLocales,
    urls = [],
    preferredUrl,
    langUrls;

    preferredLocale = tour.languages[0].locale;
    preferredUrl = tour.languages[0].locale.split("-")[0];

    if (tour.languages.length > 1) {
        for (var g = 0; g < tour.languages.length; g++) {
            var h = tour.languages[g];
            ids.push(g.id);
            locales.push(h.locale);
            urls.push(h.locale.split("-")[0]);
        }
    } else {
        ids.push(tour.languages[0].id);
        locales.push(tour.languages[0].locale);
        urls.push(tour.languages[0].locale.split("-")[0]);
    }

    langLocales = locales.join("|");
    langUrls = urls.join("|");
    return {
        ids: ids,
        preferredLocale: preferredLocale,
        locales: locales,
        langLocales: langLocales,
        preferredUrl: preferredUrl,
        urls: urls,
        langUrls: langUrls
    };
}();

function rootConfig($stateProvider, $urlRouterProvider, $locationProvider, $translateProvider, $translatePartialLoaderProvider, translatePluggableLoaderProvider, $urlMatcherFactoryProvider, tmhDynamicLocaleProvider){
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

    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: "../translations/{lang}/{part}.json"
    });

    $translatePartialLoaderProvider.addPart('app');
    $translateProvider.addInterpolation('translateService');

    console.log("Language Loaded");

    $translateProvider.preferredLanguage(languageCounter.preferredLocale);
    $translateProvider.useLocalStorage();
	// Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy("escaped");
    
    tmhDynamicLocaleProvider.localeLocationPattern("../js/angular/i18n/default/angular-locale_{{locale}}.js");
    tmhDynamicLocaleProvider.defaultLocale(languageCounter.preferredLocale);

    console.log("Angular is working");
};

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

function tourConfig(stateHelperProvider, $urlRouterProvider, $translateProvider, translatePluggableLoaderProvider, $translatePartialLoaderProvider){
    stateHelperProvider.state({
        abstract: true,
        name: "app.tour",
        url: "",
        template: '<div id="tour-view" tour-directive></div>',
        controller: "tourCtrl",
        controllerAs: "vm",
        children: (function(){
            var tourList = [];
            for (var k = 0; k < tour.maps.length; k++) {
                var l = tour.maps[k];
                tourList.push({name: l.id,
                                url: l.url + "?start_at_slide",
                                controllerAs: "vm",
                                controller: "mapsCtrl",
                                params: {id: l.id, name: l.name, url: l.url}
                            })
            }
            return tourList;
        })()
    });
    $translateProvider.useInterpolation('translateService');
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

function runCtrl($rootScope, $translate, tmhDynamicLocale, $location, $stateParams, $state){

    var vm = this;
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        $rootScope.currentLang = $stateParams.lang;

        if($rootScope.currentLang){
            for (var i = 0; i < languageCounter.locales.length; i++) {
                var urlCode = languageCounter.locales[i].split("-")[0];
                if(urlCode === $rootScope.currentLang){
                    $translate.use(urlCode);
                    $translate.refresh();
                    tmhDynamicLocale.set(languageCounter.locales[i]);
                }
            }
        }
        else if (!$rootScope.currentLang) {
            $translate.use(languageCounter.preferredUrl);
            $translate.refresh();
            tmhDynamicLocale.set(languageCounter.preferredLocale);
        }
        console.log("CurrentLang: " + $rootScope.currentLang, "Use: " + $translate.use(), "Proposed: " + $translate.proposedLanguage(), "Locale: " + tmhDynamicLocale.get());
    });

    $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
        $translate.refresh();
    });
};

function translateTourLoader($q, $timeout){
    return function(options) {
        var translations = {};
        var lang;
        var defer = $q.defer();

        if(options.key) {
            lang = options.key;
            translations = tour.translations[lang];
        } else {
            translations = tour.translations[0];
        }
        
        defer.resolve(translations);
        return defer.promise;
    }
};


// function translateFactory($http, $q, translateTourLoader){
//     return {
//         getData: function(){
//             var defer = $q.defer();
//             console.log(translateTourLoader());
//             defer.resolve(translateTourLoader)

//             return defer.promise
//             .then(function(response) {
//                 if (response.data === key) {
//                     return translations;
//                 } else {
//                     // invalid response
//                     return defer.reject('Oops... invalid response');
//                 }

//             }, function(response) {
//                 // something went wrong
//                 return defer.reject('Oops... something went wrong');
//             });
//         }
//     };
// };

function translateService($interpolate){
    var $locale;

    return {
 
    setLocale: function (locale) {
      $locale = locale;
    },
 
    getInterpolationIdentifier: function () {
      return 'custom';
    },
 
    interpolate: function (string, interpolateParams, sanitizeStrategy) {
      return $interpolate(string)(interpolateParams, sanitizeStrategy);
    },

    changeLocale: function(){

    }
  };
}

// Get Factory to return array of JSON
function mapsFactory($state, $stateParams, $http, $q){
    // var test;
    // $http.get("json/period_2.json").success(function(response) {
    //     test = response;
    // }); 
    return {
    }
};

function mapsService($state, $stateParams, $http, $q){
};

function rootCtrl($scope, $window, $log, $locale, localStorageService, $translate, $filter, $state, $rootScope, $location, $stateParams, tmhDynamicLocale) {
    $rootScope.startLang = languageCounter.preferredUrl;
    $rootScope.startLangId = languageCounter.preferredLocale;

    if (!$rootScope.startLang || tour.languages.length === 0) {
        console.error('There are no languages provided');
    }
    $translate.use($rootScope.startLang);
    tmhDynamicLocale.set($rootScope.startLangId);

    $scope.firstTour = tour.maps[0].id;
    $scope.lang = $stateParams.lang;

    angular.element(function() {
        $(".menu-collapse").sideNav({
            menuWidth: 280, // Default is 240
            edge: 'right', // Choose the horizontal origin
            closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
            draggable: true // Choose whether you can drag to open on touch screen
        });
        $('.collapsible').collapsible();
    });
};

function menuCtrl($scope, $location, $state, $stateParams){
    var langList = [];
    var pageList = [];
    var tourList =  [];

    for (var a = 0; a < tour.languages.length; a++) {
        var b = tour.languages[a];
            langList.push({"id": b.id, "url": b.locale.split("-")[0]});
    }

    for (var c = 0; c < tour.pages.length; c++) {
        var d = tour.pages[c];
            pageList.push({"url": d.url, "name": d.name});
    }

    for (var e = 0; e < tour.maps.length; e++) {
        var f = tour.maps[e];
            tourList.push({"id": f.id, "url": f.url});
    }

    $scope.langList = langList;
    $scope.pageList = pageList;
    $scope.tourList = tourList;
};

function aboutCtrl($scope, $location, $stateParams, $translate, $translatePartialLoader){
};

function teamCtrl($scope, $location, $stateParams, $translate, $translatePartialLoader){
};

function tourCtrl($scope, $location, $stateParams, $translate, $translatePartialLoader){
};

function mapsCtrl($scope, $rootScope, $location, $stateParams, $q, $timeout, $translate, $translatePartialLoader){
    $translatePartialLoader.addPart($stateParams.name);
    $translate.refresh()

	$scope.countchange = function(langKey){
		$translate.use(langKey);
		$translate.refresh();
	};

    $scope.$watch('map', function(map) {
        if(map) {
            map = {n: "asddasds"}
            // $scope.storytour.slide = new VCO.StoryTour.Slide(storytour, "json/period_2.json", storymap_options);
        }
    });
};

function tourDirective($timeout){
    var link = function($scope, element, attr){
        $scope.storymap_options = {
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
            calculate_zoom: false,
            maps: $scope.mapData
        };

        $scope.storytour = new VCO.StoryTour("storytour", "translations/" + $scope.langData + "/" + $scope.jsonData + ".json", $scope.storymap_options);
            // $timeout(function() {
            //     $scope.test = new VCO.StoryTour.Slide($scope.storytour, "json/" + $scope.jsonData + ".json", $scope.storymap_options);
            // }, 1000);

        $timeout(function () {
            angular.element(function() {
                $('.menubar-collapse').sideNav({
                menuWidth: 280, // Default is 240
                edge: 'left', // Choose the horizontal origin
                closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
                draggable: true // Choose whether you can drag to open on touch screen
                }); 
                $('.collapsible-menubar').collapsible();
                $('.modal').modal();
                $('.tooltipped').tooltip({delay: 50});
            });
        }, 500);
    }
    return {
        restrict: 'EA',
        replace: false,
        templateUrl: 'partials/maps.html',
        controller: function($scope, $stateParams){
            $scope.langData = $stateParams.lang;
            $scope.jsonData = $stateParams.url;
            $scope.mapData = tour.maps[$stateParams.id].maps;
        },
        controllerAs: 'vm',
        scope: true,
        link: link
    };
};

var appConfig = function(){
    var appName = "StoryTour",
    appDependencies = ["additionalViews", "ui.router", "ui.router.stateHelper", "LocalStorageModule", "pascalprecht.translate", "angular-translate-loader-pluggable", "tmh.dynamicLocale", "ngSanitize", "ngAnimate", "ngCookies"],

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
rootConfig.$inject = ["$stateProvider", "$urlRouterProvider", "$locationProvider", "$translateProvider", "$translatePartialLoaderProvider", "translatePluggableLoaderProvider", "$urlMatcherFactoryProvider", "tmhDynamicLocaleProvider"],

// appConfig.pushLateModules("StoryTour.localeConfig"),
// angular.module("StoryTour.localeConfig").config(localeConfig),
// localeConfig.$inject = ["tmhDynamicLocale"],

appConfig.pushLateModules(appConfig.appName + ".pages"),
angular.module(appConfig.appName + ".pages").config(pagesConfig),
pagesConfig.$inject = ["$stateProvider"],

appConfig.pushLateModules(appConfig.appName + ".tour"),
angular.module(appConfig.appName + ".tour").config(tourConfig),
tourConfig.$inject = ["stateHelperProvider", "$urlRouterProvider", "$translateProvider", "translatePluggableLoaderProvider", "$translatePartialLoaderProvider"];

angular.module(appConfig.appName).run(runCtrl),
runCtrl.$inject = ["$rootScope", "$translate", "tmhDynamicLocale", "$location", "$stateParams", "$state"]

angular.module(appConfig.appName).factory("translateTourLoader", translateTourLoader),
translateTourLoader.$inject = ["$q", "$timeout"],

// angular.module(appConfig.appName).factory("translateFactory", translateFactory),
// translateFactory.$inject = ["$http", "$q", "translateTourLoader"],

angular.module(appConfig.appName + ".tour").service("translateService", translateService),
translateService.$inject = ["$interpolate"],

angular.module(appConfig.appName + ".tour").factory("mapsFactory", mapsFactory),
mapsFactory.$inject = ["$state", "$stateParams", "$http", "$q"],

angular.module(appConfig.appName + ".tour").service("mapsService", mapsService),
mapsService.$inject = ["$state", "$stateParams", "$http", "$q"],

angular.module(appConfig.appName).controller("rootCtrl", rootCtrl),
rootCtrl.$inject = ["$scope", "$window", "$log", "$locale", "localStorageService", "$translate", "$filter", "$state", "$rootScope", "$location", "$stateParams", "tmhDynamicLocale"],

angular.module(appConfig.appName).controller("menuCtrl", menuCtrl),
menuCtrl.$inject = ["$scope", "$location", "$state", "$stateParams"],

angular.module(appConfig.appName + ".pages").controller("aboutCtrl", aboutCtrl),
aboutCtrl.$inject = ["$scope", "$location", "$stateParams", "$translate", "$translatePartialLoader"],

angular.module(appConfig.appName + ".pages").controller("teamCtrl", teamCtrl),
teamCtrl.$inject = ["$scope", "$location", "$stateParams", "$translate", "$translatePartialLoader"],

angular.module(appConfig.appName + ".tour").controller("tourCtrl", tourCtrl),
tourCtrl.$inject = ["$scope", "$location", "$stateParams", "$translate", "$translatePartialLoader"],

angular.module(appConfig.appName + ".tour").controller("mapsCtrl", mapsCtrl),
mapsCtrl.$inject = ["$scope", "$rootScope", "$location", "$stateParams", "$q", "$timeout", "$translate", "$translatePartialLoader"],

angular.module(appConfig.appName + ".tour").directive("tourDirective", tourDirective),
tourDirective.$inject = ["$timeout"]

}({VCO}, function() {return this;}() ),

angular.module("additionalViews").run(["$templateCache", function($templateCache){
    $templateCache.put("navigation.html", '<div class="st-sidebar-wrapper"><div class="st-sidebar"></div><div class="trapezoid"></div></div>'),$templateCache.put("navShell.html", '<div ui-directive></div>');
}])

);
