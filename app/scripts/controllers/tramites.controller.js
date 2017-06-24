'use strict';

angular.module('proyectorhApp')


  .controller('tramitesCtrl',['$location', '$scope', '$rootScope', '$uibModal', 'Upload',
    function($location, $scope,  $rootScope, $uibModal, Upload){

    //variables publicas
    var vm = this;
    var fire = firebase.database();
    var storageService = firebase.storage();
    vm.months = new Array("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
    vm.tramitesProcesoRegistroyControl = {};
    vm.tramitesProcesoServiciosalPersonal = {};
    vm.listaTramites = {};
    vm.listaTramitesProceso = {};
    vm.name = "";
    vm.surnames = "";
    vm.rfc = "";
    vm.tramite = "";
    vm.date = new Date();
    vm.estatus = "1";
    vm.arrayTramites=[];
    vm.allTramitesForExport = [];
    vm.myTramitesForExport = [];
    vm.usuarioTipo = ";"
    vm.usuarioOficina = "";
    vm.usuarioTramites = "";

    //funciones publicas
    vm.openModalAddTramite = openModalAddTramite;
    vm.addTramite = addTramite;
    vm.addTramiteCancel = addTramiteCancel;
    vm.showDetailsTramite = showDetailsTramite;
    vm.exportAllTramites = exportAllTramites;
    vm.exportMyTramites = exportMyTramites;
    vm.validateNameInNewTramite = validateNameInNewTramite;
    vm.validateSurnamesInNewTramite = validateSurnamesInNewTramite;
    vm.openModalLoadFile = openModalLoadFile;
    vm.subirArchivo = subirArchivo;
    vm.showDetailsMisTramites = showDetailsMisTramites;

    //funciones privadas
    function activate(){
      vm.usuarioTipo = localStorage.getItem("usuarioTipo");
      vm.usuarioOficina = localStorage.getItem("usuarioOficina");
      vm.usuarioTramites = localStorage.getItem("usuarioTramites");
      firebase.database().ref('rh/tramitesProceso')
        .on('value', function(snapshot){
          vm.tramitesProceso = snapshot.val();
          $rootScope.$apply();
        });
      getTramitesProceso();
    }
    activate();

    /* obtener la lista de tramites de un usuario en especifico */
    function getListTramites() {
      if (vm.usuarioOficina == "rc") {
        if (vm.usuarioTramites == 'A') {
          fire.ref('rh/tramites/registroyControl').orderByChild('tipoUsuario').equalTo('A').on('value', function(snapshot){
            vm.listaTramites = snapshot.val();
            $rootScope.$apply();
          });
        }
        else{
          if (vm.usuarioTramites == 'B') {
            fire.ref('rh/tramites/registroyControl').orderByChild("tipoUsuario").equalTo("B").on('value', function(snapshot){
              vm.listaTramites = snapshot.val();
              $rootScope.$apply();
          });
          }
        }
      }
      else{
        if (vm.usuarioOficina == "sp") {
          fire.ref('rh/tramites/serviciosalPersonal').on('value', function(snapshot){
            vm.listaTramites = snapshot.val();
          });
        }
      }
    }

    /* obtener los tramites en proceso de un usuario en especifico */
    function getTramitesProceso() {
      if (vm.usuarioOficina == "rc") {
        if (vm.usuarioTramites == 'A') {
          fire.ref('rh/tramitesProceso').orderByChild('usuarioOficina').equalTo('A').on('value', function(snapshot){
            vm.listaTramitesProceso = snapshot.val();
            $rootScope.$apply();
          });
        }
        else{
          if (vm.usuarioTramites == 'B') {
            fire.ref('rh/tramitesProceso').orderByChild("usuarioOficina").equalTo("B").on('value', function(snapshot){
              vm.listaTramitesProceso = snapshot.val();
              $rootScope.$apply();
          });
          }
        }
      }
      else{
        if (vm.usuarioOficina == "sp") {
          fire.ref('rh/tramitesProceso').orderByChild("oficina").equalTo("sp").on('value', function(snapshot){
              vm.listaTramitesProceso = snapshot.val();
              $rootScope.$apply();
          });
        }
      }
    }

    /* abrir modal para agregar un nuevo tramite en proceso */
    function openModalAddTramite(){
      getListTramites();
      vm.modalAddTramite = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/addTramite.modal.html',
          scope: $scope,
          size: 'nt',
          backdrop: 'static'
        });
    }

    /* realizar el registro de un nuevo tramite en proceso */
    function addTramite(){
      var fullname = vm.name + " " + vm.surnames;
      var date = dateFormat(vm.date);
      firebase.database().ref('rh/tramitesProceso/').push({
        usuario: fullname,
        rfc: vm.rfc,
        tramite: vm.tramite.nombreTramite,
        fecha: date,
        estatus: vm.estatus,
        oficina: vm.usuarioOficina,
        usuarioOficina: vm.usuarioTramites 
      }).then(function(){
        vm.modalAddTramite.dismiss();
        swal('Tramite agregado!','','success');
        vm.name = "";
        vm.surnames = "";
        vm.rfc = "";
        vm.tramite = "";
      });
    }

    /* limpiar variables y cerrar modal de nuevo tramite en proceso en caso de dar cancelar */
    function addTramiteCancel(){
      vm.modalAddTramite.dismiss();
      vm.name = "";
      vm.surnames = "";
      vm.rfc = "";
      vm.tramite = "";
    }

    /* dar formato a la fecha de la sig manera "10 de mayo del 2017" */
    function dateFormat(date) {
        var month = date.getMonth();
        var day = date.getDate();
        if (day < 10) {
          day = "0" + day;
        }
        var year = date.getUTCFullYear();
        month = vm.months[month];
        return day + " de " + month + " del " + year;
    }

    /* mostrar los detalles de un tramite en proceso de la lista general(nos dirigimos a otra vista) */
    function showDetailsTramite(key){
      localStorage.setItem("key", key);
      $location.path('/detailsTramite');
      location.href = $location.absUrl();
    }

    /* mostrar los detalles de un tramite en proceso de un usuario especifico(nos dirigimos a otra vista) */
    function showDetailsMisTramites(key){
      localStorage.setItem("key", key);
      $location.path('/detailsMisTramites');
      location.href = $location.absUrl();
    } 

    /* subir un archivo referenciado a un tramite en proceso */
    function subirArchivo( archivo ) {
      openModalLoader();
      var key = vm.saveKeyUpload;
      // referencia al lugar donde guardaremos el archivo
      var refStorage = storageService.ref(key).child(archivo.name);
      // Comienza la tarea de upload
      var uploadTask = refStorage.put(archivo);

      uploadTask.on('state_changed', function(snapshot){
        // aqui podemos monitorear el proceso de carga del archivo
      }, function(error) {
          vm.modalLoader.dismiss();
          swal("¡Error al cargar!", "No se pudo cargar el archivo", "error");
      }, function() {
          var downloadURL = uploadTask.snapshot.downloadURL;
          firebase.database().ref('rh/tramitesProceso/' + key + '/archivos').push({
            'nombreArchivo': archivo.name,
            'rutaArchivo': downloadURL
          }).then(function(){
            vm.modalLoadFile.dismiss();
            vm.modalLoader.dismiss();
            swal("¡Carga Realizada!", "Carga del archivo exitosa", "success");
          });
      });
    }

    /* funcion para abrir modal para subir un archivo referente a un tramite  */
    function openModalLoadFile( key ) {
      vm.saveKeyUpload = key;
      vm.modalLoadFile = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/loadFile.modal.html',
          scope: $scope,
          size: 'nt',
          backdrop: 'static'
        });
    }

    /* exportar todos los tramites en general que estan en proceso */
    function exportAllTramites() {
      for (var tramite in vm.tramitesProceso) {
        vm.allTramitesForExport.push({
          'Docente': vm.tramitesProceso[tramite].usuario,
          'RFC': vm.tramitesProceso[tramite].rfc,
          'Tramite': vm.tramitesProceso[tramite].tramite,
          'Fecha': vm.tramitesProceso[tramite].fecha,
          'Estatus': vm.tramitesProceso[tramite].estatus
        });
      }
      alasql('SELECT * INTO XLSX("ReporteTramites.xlsx",{headers:true}) FROM ?', [vm.allTramitesForExport]);
    }

    /* exportar los tramites en proceso especificos de cada usuario */
    function exportMyTramites() {
      for (var tramite in vm.listaTramitesProceso) {
        vm.myTramitesForExport.push({
          'Docente': vm.listaTramitesProceso[tramite].usuario,
          'RFC': vm.listaTramitesProceso[tramite].rfc,
          'Tramite': vm.listaTramitesProceso[tramite].tramite,
          'Fecha': vm.listaTramitesProceso[tramite].fecha,
          'Estatus': vm.listaTramitesProceso[tramite].estatus
        });
      }
      alasql('SELECT * INTO XLSX("ReporteTramites.xlsx",{headers:true}) FROM ?', [vm.myTramitesForExport]);
    }

    /* validar el campo nombre en el formulario de nuevo tramite en proceso(solo letras)  */
    function validateNameInNewTramite( cadena ) {
      var patron = /^[a-zñA-ZÑ\s]*$/;
      if(cadena.search(patron))
      {
        vm.name = cadena.substring(0, cadena.length-1);
      }
    }

    /* validar el campo apeliidos en el formulario de nuevo tramite en proceso(solo letras) */
    function validateSurnamesInNewTramite( cadena ) {
      var patron = /^[a-zñA-ZÑ\s]*$/;
      if(cadena.search(patron))
      {
        vm.surnames = cadena.substring(0, cadena.length-1);
      }
    }

    function openModalLoader() {
      vm.modalLoader = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/loader.modal.html',
          scope: $scope,
          size: 'loader',
          backdrop: 'static'
      });
    }

  }]);
