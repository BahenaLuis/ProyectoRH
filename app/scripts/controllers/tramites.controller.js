'use strict';

angular.module('proyectorhApp')


  .controller('tramitesCtrl',['$location', '$scope', '$rootScope', '$uibModal',
    function($location, $scope,  $rootScope, $uibModal){

    //variables publicas
    var vm = this;
    vm.months = new Array("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
    vm.tramitesProceso = {};
    vm.listaTramites = {};
    vm.name = "";
    vm.surnames = "";
    vm.rfc = "";
    vm.tramite = "";
    vm.date = new Date();
    vm.status = "1";
    vm.arrayTramites=[];

    //funciones publicas
    vm.openModalAddTramite = openModalAddTramite;
    vm.addTramite = addTramite;
    vm.addTramiteCancel = addTramiteCancel;
    vm.openModalDetailsTramite = openModalDetailsTramite;
    vm.showDetailsTramite = showDetailsTramite;

    //funciones privadas
    function activate(){
      firebase.database().ref('rh/tramitesProceso')
        .on('value', function(snapshot){
          vm.tramitesProceso = snapshot.val();
          $rootScope.$apply();
        });

        firebase.database().ref('rh/tramites/reclamosPago')
          .on('value', function(snapshot){
            vm.listaTramites = snapshot.val();
            $rootScope.$apply();
          });
    }
    activate();

    function openModalAddTramite(){
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
        estatus: vm.status
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

    vm.uploadedFormat = uploadedFormat;
    function uploadedFormat( ruta ) {
      var x = document.getElementById("pathFile").value();
      var storageRef = firebase.storage().ref();
      var mountainsRef = storageRef.child('mountains.jpg');
      var mountainImagesRef = storageRef.child('images/mountains.jpg');

    }

  }]);
