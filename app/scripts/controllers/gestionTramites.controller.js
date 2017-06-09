'use strict';

angular.module('proyectorhApp')
  .controller('gestionTramitesCtrl', ['$rootScope','$scope', '$location', '$uibModal', function ($rootScope, $scope,  $location, $uibModal) {
    //variables publicas
    var vm = this;
    var fire = firebase.database();
    vm.tramitesRegistroyControl;
    vm.tramitesServiciosalPersonal;
    vm.documentosRegistroyControl;
    vm.documentosServiciosalPersonal;
    vm.listDocumetsTramite = {};
    vm.existing = false;
    vm.office = "Registro y Control";
    vm.typeUser = "A";
    vm.documentacionTramite = [];

    //funciones publicas
    vm.openModalNewTramiteDocument = openModalNewTramiteDocument;
    vm.newTramiteDocument = newTramiteDocument;
    vm.removeTramite = removeTramite;
    vm.openModalUpdateTramite = openModalUpdateTramite;
    vm.openModalAddDocumentTramite = openModalAddDocumentTramite;
    vm.addDocument = addDocument;

    //funciones privadas
    function activate() {
      fire.ref('rh/tramites/registroyControl').on('value', function(snapshot){
        vm.tramitesRegistroyControl = snapshot.val();
        $rootScope.$apply();
      });
      fire.ref('rh/documentos/registroyControl').on('value', function(snapshot){
        vm.documentosRegistroyControl = snapshot.val();
      });
      fire.ref('rh/tramites/serviciosalPersonal').on('value', function(snapshot){
        vm.tramitesServiciosalPersonal = snapshot.val();
        $rootScope.$apply();
      });
      fire.ref('rh/documentos/serviciosalPersonal').on('value', function(snapshot){
        vm.documentosServiciosalPersonal = snapshot.val();
      });

    }
    activate();

    /* Abrir modal para agregar un nuevo tramite o documento a una  oficina  */
    function openModalNewTramiteDocument() {
      vm.modalNewTramiteDocument = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/newTramiteDocument.modal.html',
          scope: $scope,
          size: 'atd',
          backdrop: 'static'
        });
    }

    /* abrir modal para actualizar un tramite(documentacion) */
    function openModalUpdateTramite( oficina, keyTramite ) {
      vm.saveKeyTramite = keyTramite;
      getDocumentacion(oficina, keyTramite);
      vm.modalUpdateTramite = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/updateTramitewithDocuments.modal.html',
          scope: $scope,
          size: 'atd',
          backdrop: 'static'
        });
    }

    /* funcion para obtener la documentacion que requiere un tramite */
    function getDocumentacion(oficina, keyTramite) {
      vm.documentacionTramite = [];
      oficina = convertOffice(oficina);
      fire.ref('rh/tramites/' + oficina + '/' + keyTramite + '/documentos').on('value', function(snapshot){
          vm.listKeyDocumetsTramite = snapshot.val();
      });
      var documentsOffice;
      if (oficina == "registroyControl") {
        documentsOffice = vm.documentosRegistroyControl;
      }
      else{
        documentsOffice = vm.documentosServiciosalPersonal;
      }
      for (var keyDoc in vm.listKeyDocumetsTramite) {
        for (var index in documentsOffice) {
          if (keyDoc == documentsOffice[index].$key) {
            var x = {
              'keyDocumento': documentsOffice[index].$key,
              'nombreDocumento': documentsOffice[index].nombreDocumento
            };
            vm.documentacionTramite.push(x);
            break;
          }
        }
      }
    }

    /* Añadir un documento a un tramite */
    function addDocument(oficina, keyDocumento ) {
      getDocumentacion(oficina, vm.saveKeyTramite);
      oficina = convertOffice( oficina );
      fire.ref('rh/tramites/' + oficina + '/' + vm.saveKeyTramite + '/documentos').child(keyDocumento).set({
        'keyDocumento': keyDocumento
      }).then(function(){
        var nameDoc = getNameDoc( oficina, keyDocumento );
        var dataNewDoc = {
          'keyDocumento': keyDocumento,
          'nombreDocumento': nameDoc
        }
        vm.documentacionTramite.push(dataNewDoc);
        vm.modalAddDocumentTramite.dismiss();
      });
    }

    /* Si solo tenemos la key del documento, con esta funcion obtenemmos su nombre*/
    function getNameDoc( oficina, key ) {
      var listDocuments = {};
      if (oficina == "registroyControl") {
        listDocuments = vm.documentosRegistroyControl;
      }
      else{
        listDocuments = vm.documentosServiciosalPersonal;
      }
      for (var index in listDocuments) {
        if (key == listDocuments[index].$key) {
          return listDocuments[index].nombreDocumento;
        }
      }
    }
    
    /* Abrir modal para añadir un documento a un tramite */
    function openModalAddDocumentTramite( ) {
      vm.modalAddDocumentTramite = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/addDocumentTramite.modal.html',
          scope: $scope,
          size: 'atd',
          backdrop: 'static'
        });
        $rootScope.$apply();
    }

    /* funcion para agregar un nuevo tramite o documento a una oficina */
    function newTramiteDocument( nombreTramiteDocumento, oficina, usuarioTipo ) {
      if (oficina == undefined) {
        vm.nameTramiteDocument = "";
        swal("¿Qué oficina?", "Debes seleccionar una oficina", "error");
      }
      else{
        oficina = convertOffice( oficina );
        if (vm.newTramite) {
          verifyName(nombreTramiteDocumento, oficina);
          if (vm.existing) {
            vm.existing = false; vm.newTramite = false; vm.newDocument = false;
            swal("Error", "Ya existe un tramite con ese nombre", "error");
          }
          else{
            if (!vm.existing) {
              if (oficina == "registroyControl") {
                fire.ref('rh/tramites/' + oficina).push({
                 'nombreTramite': nombreTramiteDocumento,
                 'tipoUsuario': usuarioTipo
                }).then(function(){
                  vm.newTramite = false; 
                });
              }
              else{
                fire.ref('rh/tramites/' + oficina).push({
                    'nombreTramite': nombreTramiteDocumento
                }).then(function(){
                  vm.newTramite = false; 
                });
              }
            }
          }
        }
        else{
          if (vm.newDocument) {
            fire.ref('rh/documentos/' + oficina).push({
              'nombreDocumento': nombreTramiteDocumento
            }).then(function(){
              vm.newDocument = false;
            });
          }
        }
      }
      vm.nameTramiteDocument = "";
      vm.modalNewTramiteDocument.dismiss();
      
    }

    function convertOffice( oficina ) {
      if (oficina == "Registro y Control") {
        return "registroyControl";
      }
      else{
        if (oficina == "Servicios al Personal") {
          return "serviciosalPersonal";
        }
      }
    }

    /* verificar al agregar un nuevo tramite que no exista uno con el mismo nombre */
    function verifyName( nombreTramiteDocumento, oficina ) {
      switch (oficina) {
        case "registroyControl":
          for (var index in vm.tramitesRegistroyControl) {
            if (vm.tramitesRegistroyControl[index].nombreTramite == nombreTramiteDocumento) {
              vm.existing = true
            }
          }
          break;
        case "serviciosalPersonal":
          for (var index in vm.tramitesServiciosalPersonal) {
            if (vm.tramitesServiciosalPersonal[index].nombreTramite == nombreTramiteDocumento) {
              vm.existing = true
            }
          }
          break;
      }
    }

    /* remover un tramite de una oficina */
    function removeTramite ( oficina, key ) {
      switch ( oficina ) {
        case "Registro y Control":
          fire.ref( 'rh/tramites/registroyControl/' + key ).remove();
          break;
      
        case "Servicios al Personal":
          fire.ref( 'rh/tramites/serviciosalPersonal/' + key ).remove();
          break;
      }
      /*fire.ref('rh/')*/
    }

    vm.removeDocumentOfTramite = removeDocumentOfTramite;

    function removeDocumentOfTramite( oficina,  keyDocumento ) {
      oficina = convertOffice(oficina);
      fire.ref('rh/tramites/' + oficina + '/' + vm.saveKeyTramite + '/documentos/' + keyDocumento).remove().then(function(){
        for (var index in vm.documentacionTramite) {
          if (keyDocumento == vm.documentacionTramite[index].keyDocumento) {
            vm.documentacionTramite.splice(index, 1);
            $rootScope.$apply();
          }
        }
      });
    
    }

    function convertJsontoArray( json ) {
      var array = [];
      for (var tramite in json) {
        array.push(json[tramite].nombreTramite);
      }
      return array;
    }


  }]);
