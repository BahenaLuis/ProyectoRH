'use strict';

angular.module('proyectorhApp')


  .controller('tramitesCtrl',['$location', '$scope', '$rootScope', '$uibModal', 'Upload',
    function($location, $scope,  $rootScope, $uibModal, Upload){

    //variables publicas
    var vm = this;
    var fire = firebase.database();
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
    vm.tramitesForExport = [];
    vm.usuarioTipo = ";"
    vm.usuarioOficina = "";
    vm.usuarioTramites = "";

    //funciones publicas
    vm.openModalAddTramite = openModalAddTramite;
    vm.addTramite = addTramite;
    vm.addTramiteCancel = addTramiteCancel;
    vm.openModalDetailsTramite = openModalDetailsTramite;
    vm.showDetailsTramite = showDetailsTramite;
    vm.exportTramites = exportTramites;
  

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

    function getListTramites() {
      if (vm.usuarioOficina == "rc") {
        if (vm.usuarioTramites == 'A') {
          fire.ref('rh/tramites/registroyControl').orderByChild('tipoUsuario').equalTo('A').on('value', function(snapshot){
            vm.listaTramites = snapshot.val();
          });
        }
        else{
          if (vm.usuarioTramites == 'B') {
            fire.ref('rh/tramites/registroyControl').orderByChild("tipoUsuario").equalTo("B").on('value', function(snapshot){
              vm.listaTramites = snapshot.val();
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

    function addTramite(){
      var fullname = vm.name + " " + vm.surnames;
      var date = dateFormat(vm.date);
      firebase.database().ref('rh/tramitesProceso/').push({
        usuario: fullname,
        rfc: vm.rfc,
        tramite: vm.tramite,
        fecha: date,
        estatus: vm.estatus,
        oficina: vm.usuarioOficina,
        usuarioOficina: vm.usuarioTramites 
      });

      vm.modalAddTramite.dismiss();
      swal('Tramite agregado!','','success');
      vm.name = "";
      vm.surnames = "";
      vm.rfc = "";
      vm.tramite = "";
    }

    function addTramiteCancel(){
      vm.modalAddTramite.dismiss();
      vm.name = "";
      vm.surnames = "";
      vm.rfc = "";
      vm.tramite = "";
    }

    function dateFormat(date) {
        var month = date.getMonth();
        var day = ("0" + (date.getUTCDate())).slice(-2);
        var year = date.getUTCFullYear();
        month = vm.months[month];
        return day + " de " + month + " del " + year;
    }

    function openModalDetailsTramite(){
      vm.modalDetailsTramite = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/detailsTramite.modal.html',
          scope: $scope,
          size: 'dt',
          backdrop: 'static'
        });
    }

    function detailsTramiteClose(){
        vm.modalDetailsTramite.dismiss();
    }

    function showDetailsTramite(key){
      localStorage.setItem("key", key);
      $location.path('/detailsTramite');
      location.href = $location.absUrl();
    }

    vm.showDetailsMisTramites = showDetailsMisTramites;
    function showDetailsMisTramites(key){
      localStorage.setItem("key", key);
      $location.path('/detailsMisTramites');
      location.href = $location.absUrl();
    }



    // var inputElement = document.getElementById("input");
    // inputElement.addEventListener("change", handleFiles, false);
    // function handleFiles() {
    //   var fileList = this.files; /* now you can work with the file list */
    // }

    // $window.onload = function(){
    //   document.getElementById('pathFile').addEventListener('change', function(evento){
    //     evento.preventDefault();
    //     vm.archivo  = evento.target.files[0];
    //     subirArchivo(vm.archivo);
    //   });
    // }


    vm.uploadedFormat = uploadedFormat;
    function uploadedFormat( archivo ) {

      var x = archivo;
      // var fd = new FormData();
      // //Take the first selected file
      // fd.append("file", file[0]);

      // var x = document.getElementById("pathFile").value();
      // var y = document.getElementById("pathFile").value;
      //
      // var uploadTask = firebase.storage().ref(y).put();
      // var mountainsRef = storageRef.child('mountains.jpg');
      // var mountainImagesRef = storageRef.child('images/mountains.jpg');



      // document.getElementById("pathFile").addEventListener('change', function(evento){
      //   evento.preventDefault();
      //   vm.archivo  = evento.target.files[0];
      // });
      //
      // // creo una referencia al lugar donde guardaremos el archivo
      // var refStorage = storageService.ref('micarpeta').child(vm.archivo.name);
      // // Comienzo la tarea de upload
      // var uploadTask = refStorage.put(vm.archivo);
      //
      // // defino un evento para saber qué pasa con ese upload iniciado
      // uploadTask.on('state_changed', null,
      //   function(error){
      //     console.log('Error al subir el archivo', error);
      //   },
      //   function(){
      //     console.log('Subida completada');
      //     // mensajeFinalizado(uploadTask.snapshot.downloadURL, uploadTask.snapshot.totalBytes);
      //   }
      // );

      // document.getElementById('pathFile').addEventListener('change', function(evento){
      //   evento.preventDefault();
      //   vm.archivo  = evento.target.files[0];
      //   subirArchivo(vm.archivo);
      // });

    }


    var storageService = firebase.storage();

    vm.subirArchivo = subirArchivo;
    function subirArchivo( archivo ) {
      var key = vm.saveKeyUpload;
      // creo una referencia al lugar donde guardaremos el archivo
      var refStorage = storageService.ref(key).child(archivo.name);
      // Comienzo la tarea de upload
      var uploadTask = refStorage.put(archivo);

      uploadTask.on('state_changed', function(snapshot){
        // Observe state change events such as progress, pause, and resume
        // See below for more detail
      }, function(error) {
          swal("¡Error al cargar!", "No se pudo cargar el archivo", "error");
      }, function() {
          swal("¡Carga Realizada!", "Carga del archivo exitosa", "success");
          var downloadURL = uploadTask.snapshot.downloadURL;
          firebase.database().ref('rh/tramitesProceso/' + key + '/archivos').push({
            'nombreArchivo': archivo.name
            // 'rutaDescarga': downloadURL
          });
          vm.modalLoadFile.dismiss();

      });
    }



    vm.openModalLoadFile = openModalLoadFile;
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

    function exportTramites() {

      for (var tramite in vm.tramitesProceso) {
        var d = tramite.usuario;
        vm.tramitesForExport.push({
          'Docente': vm.tramitesProceso[tramite].usuario,
          'RFC': vm.tramitesProceso[tramite].rfc,
          'Tramite': vm.tramitesProceso[tramite].tramite,
          'Fecha': vm.tramitesProceso[tramite].fecha,
          'Estatus': vm.tramitesProceso[tramite].estatus
        });
      }
      alasql('SELECT * INTO XLSX("ReporteTramites.xlsx",{headers:true}) FROM ?', [vm.tramitesForExport]);
    }

  }]);
