'use strict';

/**
 * @ngdoc function
 * @name proyectorhApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the proyectorhApp
 */
angular.module('proyectorhApp')
  .controller('MainCtrl', function ($rootScope) {
    var vm = this;


    //variables publicas
    vm.mensaje = "Como estas";


    //funciones publicas



    //funciones privadas


    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
