'use strict';

angular.module('proyectorhApp')
  .controller('gestionTramitesCtrl', ['$rootScope','$scope', '$location', '$uibModal', '$timeout',
  function ($rootScope, $scope,  $location, $uibModal, $timeout) {
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
    vm.docsOffice = "Registro y Control";
    vm.documentToTramite = "";
    vm.isNewDocument = false;
    vm.isNewTramite = false;

    //funciones publicas
    vm.openModalNewTramite = openModalNewTramite;
    vm.openModalNewDocument = openModalNewDocument;
    vm.newTramite = newTramite;
    vm.newDocument = newDocument;
    vm.removeTramite = removeTramite;
    vm.openModalUpdateTramite = openModalUpdateTramite;
    vm.openModalAddDocumentTramite = openModalAddDocumentTramite;
    vm.addDocument = addDocument;
    vm.saveOffice = saveOffice;
    vm.removeDocumentOfTramite = removeDocumentOfTramite;

    //funciones privadas
    function activate() {
      vm.docsOffice = localStorage.getItem("office");
      vm.office = localStorage.getItem("office");
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

    function openModalLoader() {
      vm.modalLoader = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/loader.modal.html',
          scope: $scope,
          size: 'loader',
          backdrop: 'static'
        });
    }
    
    function saveOffice() {
      localStorage.setItem("office", vm.office);
    }

    /* Abrir modal para agregar un nuevo tramite a una  oficina  */
    function openModalNewTramite() {
      vm.modalNewTramite = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/newTramite.modal.html',
          scope: $scope,
          size: 'atd',
          backdrop: 'static'
        });
    }

    /* Abrir modal para agregar un nuevo documento a una  oficina  */
    function openModalNewDocument() {
      vm.modalNewDocument = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/newDocument.modal.html',
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
      $rootScope.$apply();
    }

    /* funcion para obtener la documentacion que requiere un tramite */
    function getDocumentacion(oficina, keyTramite) {
      vm.documentacionTramite = [];
      oficina = convertOffice(oficina);
      fire.ref('rh/tramites/' + oficina + '/' + keyTramite + '/documentos').once('value', function(snapshot){
          vm.listKeyDocumetsTramite = snapshot.val();
          var documentsOffice;
          if (oficina == "registroyControl") {
            documentsOffice = vm.documentosRegistroyControl;
          }
          else{
            documentsOffice = vm.documentosServiciosalPersonal;
          }
          for (var keyDoc in vm.listKeyDocumetsTramite) {
            for (var index in documentsOffice) {
              if (keyDoc == index) {
                var x = {
                  'keyDocumento': index,
                  'nombreDocumento': documentsOffice[index].nombreDocumento
                };
                vm.documentacionTramite.push(x);
                break;
              }
            }
          }
      });
      
    }

    /* Añadir un documento a un tramite */
    function addDocument(oficina, keyDocumento ) {
      openModalLoader();
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
        vm.modalLoader.dismiss();
        vm.modalAddDocumentTramite.dismiss();
        vm.documentToTramite = "";
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
    }

    /* funcion para agregar un nuevo tramite a una oficina */
    function newTramite( nombreTramite, oficina, usuarioTipo ) {
      oficina = convertOffice( oficina );
      verifyName(nombreTramite, oficina);
      if (vm.existing) {
        vm.existing = false; 
        swal("Error", "Ya existe un tramite con ese nombre", "error");
      }
      else{
        if (!vm.existing) {
          if (oficina == "registroyControl") {
            fire.ref('rh/tramites/' + oficina).push({
              'nombreTramite': nombreTramite,
              'tipoUsuario': usuarioTipo
            }).then(function(){
              vm.nameTramite = "";
              vm.modalNewTramite.dismiss();
              vm.isNewTramite = false; 
            });
          }
          else{
            fire.ref('rh/tramites/' + oficina).push({
                'nombreTramite': nombreTramite
            }).then(function(){
              vm.nameTramite = "";
              vm.modalNewTramite.dismiss();
              vm.isNewTramite = false; 
            });
          }
        }
      }


     /* if (vm.newTramite) {
        
      }
      else{
        if (vm.newDocument) {
          fire.ref('rh/documentos/' + oficina).push({
            'nombreDocumento': nombreTramiteDocumento
          }).then(function(){
            vm.newDocument = false;
          });
        }
      }*/

      
      
    }

    function newDocument( nombreDocumento, oficina ) {
      oficina = convertOffice( oficina );
      verifyName(nombreDocumento, oficina);
      if (vm.existing) {
        vm.existing = false; 
        swal("Error", "Ya existe un documento con ese nombre", "error");
      }
      else{
        if (!vm.existing) {
          fire.ref('rh/documentos/' + oficina).push({
            'nombreDocumento': nombreDocumento
          }).then(function(){
            vm.nameDocument = "";
            vm.modalNewDocument.dismiss();
            vm.isNewDocument = false;
          });
        }
      }

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
          if (vm.isNewTramite) {
            for (var index in vm.tramitesRegistroyControl) {
              if (vm.tramitesRegistroyControl[index].nombreTramite == nombreTramiteDocumento) {
                vm.existing = true;
                break;
              }
            }
          }
          else{
            if (vm.isNewDocument) {
              for (var index in vm.documentosRegistroyControl) {
                if (vm.documentosRegistroyControl[index].nombreDocumento == nombreTramiteDocumento) {
                  vm.existing = true;
                  break;
                }
              }
            }
          }
          break;
        case "serviciosalPersonal":
          if (vm.isNewTramite) {
            for (var index in vm.tramitesServiciosalPersonal) {
              if (vm.tramitesServiciosalPersonal[index].nombreTramite == nombreTramiteDocumento) {
                vm.existing = true
              }
            }
          }
          else{
            if (vm.isNewDocument) {
              for (var index in vm.documentosServiciosalPersonal) {
                if (vm.documentosServiciosalPersonal[index].nombreDocumento == nombreTramiteDocumento) {
                  vm.existing = true;
                  break;
                }
              }
            }
          }
          break;
      }
    }

    /* remover un tramite de una oficina */
    function removeTramite ( oficina, key ) {
       swal({
        title: '¿Esta seguro?',
        text: "Realmente desea eliminar el tramite",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then(function () {
        switch ( oficina ) {
          case "Registro y Control":
            fire.ref( 'rh/tramites/registroyControl/' + key ).remove().then(function(){
              swal(
              '¡Borrado!',
              'El tramite ha sido borrado',
              'success'
              )
            });
            break;
        
          case "Servicios al Personal":
            fire.ref( 'rh/tramites/serviciosalPersonal/' + key ).remove().then(function(){
              swal(
              '¡Borrado!',
              'El tramite ha sido borrado',
              'success'
              )
            });
            break;
        }

      });
    }

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
