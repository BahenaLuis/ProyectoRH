'use strict';

angular.module('proyectorhApp')
  .controller('menuCtrl',['$location', '$rootScope', function($location, $rootScope){

    var vm = this;

    //variables publicas
    vm.msg = "Has accedido al menu";
    vm.signOut = cerrarSesion;

    //funciones publicas

    //funciones privadas


    function cerrarSesion()
    {
      firebase.auth().signOut().then(function() {
        $location.path('/login');
        location.href = $location.absUrl();
        console.log("Sesion cerrada exitosamente");
      }, function(error) {
        // An error happened.
      });
    }

  }]);
