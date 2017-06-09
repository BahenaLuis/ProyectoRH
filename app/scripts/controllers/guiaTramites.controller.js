'use strict';

angular.module('proyectorhApp')
  .controller('guiaTramites', ['$rootScope','$scope', '$location', '$uibModal', function ($rootScope, $scope,  $location, $uibModal) {
    //variables publicas
    var vm = this;
    var fire = firebase.database();
    vm.listaTramites = {};
    vm.documentacionGen = {};

    //funciones publicas
    vm.saveArea = saveArea;


    //funciones privadas
    function activate() {
      getTramitesArea();
    }
    activate();

    function getTramitesArea() {
      switch (localStorage.getItem("area")) {
        case "registroyControl":
          /*fire.ref('rh/documentacion/registroycontrol/reclamoDePagos')
            .on('value', function(snapshot) {
              vm.documentacionGen = snapshot.val();
            });*/
          fire.ref('rh/tramites/registroyControl').once('value', function(snapshot){
            vm.listaTramites = snapshot.val();
            $rootScope.$apply();
          });
          break;
        case "serviciosalPersonal":
            fire.ref('rh/tramites/serviciosalPersonal').once('value', function(snapshot){
            vm.listaTramites = snapshot.val();
            $rootScope.$apply();
            });
          break;
        case "3":

          break;
        default:
      }
    }

    function saveArea( area ) {
      localStorage.setItem("area", area);
      $location.path('/guiaTramites');
      location.href = $location.absUrl();
    }

    vm.docsTramite = [];
    vm.getDocumentacion = getDocumentacion;
    function getDocumentacion( documentacion ) {
      vm.docsTramite = [];
      var docs = documentacion.split(",");
      for (var index in docs) {
        for (var indice in vm.documentacionGen) {
          if (docs[index] == indice) {
            vm.docsTramite.push(vm.documentacionGen[indice]);
          }
        }
      }
      vm.modalDocumentacionTramite = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/documentacionTramite.modal.html',
          scope: $scope,
          size: 'doc',
          backdrop: 'static'
        });

    }


  }]);
