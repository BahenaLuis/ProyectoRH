'use strict';

angular.module('proyectorhApp')
  .controller('guiaTramites', ['$rootScope','$scope', '$location', '$uibModal', function ($rootScope, $scope,  $location, $uibModal) {
    //variables publicas
    var vm = this;
    var fire = firebase.database();
    vm.listaTramitesRegistroyControl = {};
    vm.listaTramitesServiciosalPersonal = {};
    vm.documentosRegistroyControl = {};
    vm.documentosServiciosalPersonal = {};
    vm.documentacionGen = {};

    vm.docsTramite = [];
    vm.array = {};

    //funciones publicas
    vm.saveArea = saveArea;
    vm.getDocumentacion = getDocumentacion;


    //funciones privadas
    function activate() {
      vm.globalArea = localStorage.getItem("area");
      getTramitesArea();
      fire.ref('rh/tramites/registroyControl').on('value', function(snapshot){
        vm.listaTramitesRegistroyControl = snapshot.val();
      });

      fire.ref('rh/tramites/serviciosalPersonal').on('value', function(snapshot){
        vm.listaTramitesServiciosalPersonal = snapshot.val();
      });

      fire.ref('rh/documentos/registroyControl').on('value', function(snapshot){
        vm.documentosRegistroyControl = snapshot.val();
      });

      fire.ref('rh/documentos/serviciosalPersonal').on('value', function(snapshot){
        vm.documentosServiciosalPersonal = snapshot.val();
      });

    }
    activate();

    function getTramitesArea() {
      switch (localStorage.getItem("area")) {
        case "registroyControl":
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

    
    
    function getDocumentacion( nombreTramite, key ) {
      vm.docsTramite = [];
      var x = addKeytoObject(vm.listaTramitesRegistroyControl);
      var y = addKeytoObject(vm.listaTramitesServiciosalPersonal);
      var x1 = addKeytoObject(vm.documentosRegistroyControl);
      var y1 = addKeytoObject(vm.documentosServiciosalPersonal);


      var area = localStorage.getItem("area");
      if (area == 'registroyControl') {
        //vm.listaTramitesRegistroyControl = addKeytoObject(vm.listaTramitesRegistroyControl);
        var tramite = _.find(x, function(item){ return item.$key == key});
      }
      else{
        if (area == 'serviciosalPersonal') {
          //vm.listaTramitesServiciosalPersonal = addKeytoObject(vm.listaTramitesServiciosalPersonal);
          var tramite = _.find(y, function(item){ return item.$key == key});
        }
      }


      for (var keyDoc in tramite.documentos) {
        if (area == 'registroyControl') {
          //vm.documentosRegistroyControl = addKeytoObject(vm.documentosRegistroyControl);
          var documento = _.find(x1, function(item){ return item.$key == keyDoc});
          if (documento != undefined) {
            vm.docsTramite.push(documento.nombreDocumento);
          }
        }
        else{
          if (area == 'serviciosalPersonal') {
            //vm.documentosServiciosalPersonal = addKeytoObject(vm.documentosServiciosalPersonal);
            var documento = _.find(y1, function(item){ return item.$key == keyDoc});
            if (documento != undefined) {
              vm.docsTramite.push(documento.nombreDocumento);
            }     
          }
        }
      }
      openModalDocumentacion();
      $rootScope.$apply();
    }

    function openModalDocumentacion() {
      vm.modalDocumentacionTramite = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/documentacionTramite.modal.html',
          scope: $scope,
          size: 'doc',
          backdrop: 'static'
      });
    }

    function addKeytoObject( obj ) {
      return Object.keys(obj).map(function (key) {
        var value = obj[key];
        return angular.isObject(value) ?
          Object.defineProperty(value, '$key', { enumerable: false, value: key}) :
          { $key: key, $value: value };
      }); 
    }


  }]);
