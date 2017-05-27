'use strict';

/**
 * @ngdoc overview
 * @name proyectorhApp
 * @description
 * # proyectorhApp
 *
 * Main module of the application.
 */
var proyectorhApp = angular
  .module('proyectorhApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'firebase',
    'ui.bootstrap',
    'angular-toArrayFilter'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'loginCtrl as vm'
      })
      .state('tramites', {
          url: '/tramites',
          templateUrl: 'views/tramites.html',
          controller: 'tramitesCtrl as vm'
      })
      .state('menu', {
              url: '/menu',
              templateUrl: 'views/menu.html',
              // controller: 'menuCtrl as vm'
      })
      .state('resetPassword', {
            url: '/resetPassword',
            templateUrl: 'views/resetPassword.html',
            controller: 'loginCtrl as vm'
      })
      .state('detailsTramite', {
            url: '/detailsTramite',
            templateUrl: 'views/detailsTramite.html',
            controller: 'detailsTramiteCtrl as vm'
      })
      .state('misTramites', {
            url: '/misTramites',
            templateUrl: 'views/misTramites.html',
            controller: 'detailsTramiteCtrl as vm'
      })
      .state('areasRecursosH', {
          url: '/areasRecursosH',
          templateUrl: 'views/areasRecursosH.html',
          controller: 'guiaTramites as vm'
      })
      .state('guiaTramites', {
          url: '/guiaTramites',
          templateUrl: 'views/guiaTramites.html',
          controller: 'guiaTramites as vm'
      });
      $urlRouterProvider.otherwise('/login');

      var config = {
        apiKey: "AIzaSyB_z32N7CGFtmctcitlWq3X7j0hY-vcK2o",
        authDomain: "administracionrh-a403c.firebaseapp.com",
        databaseURL: "https://administracionrh-a403c.firebaseio.com",
        projectId: "administracionrh-a403c",
        storageBucket: "administracionrh-a403c.appspot.com",
        messagingSenderId: "330916942529"
      };
      firebase.initializeApp(config);
  });
