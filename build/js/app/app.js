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
    preferredUrl = tour.languages[0].url;

    if (tour.languages.length > 1) {
        for (var g = 0; g < tour.languages.length; g++) {
            var h = tour.languages[g];
            ids.push(h.id);
            urls.push(h.url);
        }
    } else {
        ids.push(tour.languages[0].id);
        urls.push(tour.languages[0].url);
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
                    template: "<ui-view/>",
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

    for (var ids in tour.translations){
        if(tour.translations.hasOwnProperty(ids)){
            $translateProvider.translations(ids, tour.translations[ids]);
        }
    }

    $translateProvider.preferredLanguage(languageCounter.preferredId);
    $translateProvider.useLocalStorage();

    // Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy("escaped");
    tmhDynamicLocaleProvider.localeLocationPattern("/js/angular/i18n/angular-locale_{{locale}}.js");
    tmhDynamicLocaleProvider.defaultLocale(languageCounter.preferredId);
};

function localeConfig($translate, languageCounter, $rootScope, tmhDynamicLocale){
    var locales = languageCounter.urls,
    preferredLocale = languageCounter.preferredLocale;
    var currentLocale = $translate.proposedLanguage();
    var setLocale = function (locale) {
      if (!checkLocaleIsValid(locale)) {
        console.error('Locale name "' + locale + '" is invalid');
        return;
      }
    };
    $translate.use(locale);
    tmhDynamicLocale.set();
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

function sitesConfig($stateProvider){
    for (var k = 0; k < tour.maps.length; k++) {
        var l = tour.maps[k];
        $stateProvider.state("app." + l.name, {
            url: "tour/:" + l.tourId + "?prim&sec&tert",
            template: '<div sites-directive></div>',
            controller: "sitesCtrl",
            controllerAs: "vm",
            params: {   
                tourId: {squash: true, value: null },
                prim: {squash: true, value: null },
                sec: {squash: true, value: null },
                tert: {squash: true, value: null }
            },
            data: {
                pageTitle: l.title
                }
        });
    } 
};

function rootCtrl($scope, $window, $log, $locale, localStorageService, $translate, $filter, $state, $rootScope, $location, $stateParams, tmhDynamicLocale) {
    var vm = this;
    console.log($stateParams);
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        $rootScope.currentLang = $stateParams.lang;
        $translate.use($rootScope.currentLang);
    });

    $rootScope.startLang = languageCounter.preferredId;
    $rootScope.currentLang = $translate.proposedLanguage();

    if (!$rootScope.startLang || tour.languages.length === 0) {
        console.error('There are no languages provided');
    } 
    $translate.use("es-es");

    tmhDynamicLocale.set($rootScope.startLang);

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

        if (angular.extend(vm, toState.data), -1 !== $location.absUrl().indexOf("#!") && "localhost" !== $location.host() && void 0 !== $stateParams.lang) {
            $rootScope.currentLang = $stateParams.lang;
            $rootScope.otherLangURL = $location.absUrl().replace("/" + $stateParams.lang, "/" + otherLang);
        } else {
            $rootScope.currentLang = $stateParams.lang;
        }
        console.log($stateParams.lang);
    });

    $scope.lang = $stateParams.lang;
    $scope.changeLanguage = function(langKey) {
        $translate.use(langKey);
    };
};

function aboutCtrl($scope, $location, $stateParams){

};

function tourCtrl($scope, $location, $stateParams){

};

function sitesCtrl($scope, $location, $stateParams){

};

function sitesDirective(){
        return {
            restrict: 'EA',
            replace: false,
            template: '<div id="storytour" class="storymap"></div>',
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
    appDependencies = ["additionalViews", "ui.router", "LocalStorageModule", "pascalprecht.translate", "tmh.dynamicLocale", "ngSanitize", "ngAnimate", "ngCookies"],

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

appConfig.pushLateModules("StoryTour.navigation"),

appConfig.pushLateModules("StoryTour.pages"),
angular.module("StoryTour.pages").config(pagesConfig),
pagesConfig.$inject = ["$stateProvider"],

appConfig.pushLateModules("StoryTour.sites"),
angular.module("StoryTour.sites").config(sitesConfig),
sitesConfig.$inject = ["$stateProvider"],

// appConfig.pushLateModules("StoryTour.tests"),
// angular.module("StoryTour.tests").run(testRuns),

angular.module(appConfig.appName).controller("rootCtrl", rootCtrl),
rootCtrl.$inject = ["$scope", "$window", "$log", "$locale", "localStorageService", "$translate", "$filter", "$state", "$rootScope", "$location", "$stateParams", "tmhDynamicLocale"],

angular.module(appConfig.appName).controller("aboutCtrl", aboutCtrl),
aboutCtrl.$inject = ["$scope", "$location", "$stateParams"],

angular.module(appConfig.appName).controller("tourCtrl", tourCtrl),
tourCtrl.$inject = ["$scope", "$location", "$stateParams"],

angular.module(appConfig.appName).controller("sitesCtrl", sitesCtrl),
sitesCtrl.$inject = ["$scope", "$location", "$stateParams"],

angular.module(appConfig.appName).directive("sitesDirective", sitesDirective)

}({VCO}, function() {return this;}() ),

angular.module("additionalViews").run(["$templateCache", function($templateCache){
    $templateCache.put("navigation.html", '<div class="st-sidebar-wrapper"><div class="st-sidebar"></div><div class="trapezoid"></div></div>'),$templateCache.put("navShell.html", '<div ui-directive></div>');
}])

);
