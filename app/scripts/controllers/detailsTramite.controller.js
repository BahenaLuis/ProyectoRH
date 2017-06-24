'use strict';

var app = angular.module('proyectorhApp')
  .controller('detailsTramiteCtrl',['$location', '$scope', '$rootScope', '$uibModal', '$window',
    function($location, $scope,  $rootScope, $uibModal, $window){

    // variables publicas
    var vm = this;
    var fire = firebase.database();
    var storageService = firebase.storage();
    vm.months = new Array("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
    vm.texto;
    var fecha;
    vm.estado1 = false;
    vm.estado2 = false;
    vm.estado3 = false;

    // funciones publicas
    vm.showDetailsTramite = showDetailsTramite;
    vm.comment = comment;
    vm.returnTramites = returnTramites;
    vm.editComment = editComment;
    vm.updateComment = updateComment;
    vm.deleteComment = deleteComment;
    vm.validateComments = validateComments;
    vm.openModalLoader = openModalLoader;
    vm.borrarArchivo = borrarArchivo;
    vm.downloadFile = downloadFile;


    // funciones privadas
    function activate(){
      vm.usuarioTipo = localStorage.getItem("usuarioTipo");

      fire.ref('rh/tramitesProceso')
        .on('value', function(snapshot){
          vm.tramitesProceso = snapshot.val();
          showDetailsTramite();
          $rootScope.$apply();
          newComentsVisible();
        });
    }
    activate();

    function getDate() {
        var date = new Date();
        var month = date.getMonth();
        var day = ("0" + (date.getUTCDate())).slice(-2);
        var year = date.getUTCFullYear();
        month = vm.months[month];
        return day + " de " + month + " del " + year;
    }

    function showDetailsTramite(){
      for (var key in vm.tramitesProceso) {
        if (localStorage.getItem("key") == key) {
          vm.detailsTramite = vm.tramitesProceso[key];
          break;
        }
      }
      verifyStatus();
      // var estatus = vm.detailsTramite.estatus;
      // switch (estatus) {
      //   case 1:
      //     vm.estado1 = true;
      //     break;
      //   case 2:
      //     vm.estado2 = true;
      //     break;
      //   case 3:
      //     vm.estado3 = true;
      //     break;
      // }

      // firebase.database().ref('rh/tramitesProceso/' + localStorage.getItem("key") + '/comentarios')
      //   .on('value', function(snapshot){
      //     vm.commentsTramite = snapshot.val();
      //   });
    }
    function verifyStatus() {
      var estatus = vm.detailsTramite.estatus;
      vm.estado1 = false; vm.estado2 = false; vm.estado3 = false;
      switch (estatus) {
        case "1":
          vm.estado1 = true;
          break;
        case "2":
          vm.estado2 = true;
          break;
        case "3":
          vm.estado3 = true;
          break;
      }
    }

    function comment(comentario){
      fecha = getDate();
      fire.ref('rh/tramitesProceso/' + localStorage.getItem("key") + '/comentarios').push({
        'comentario': comentario,
        'usuarioNombre': localStorage.getItem("usuarioNombre"),
        'fecha': fecha
      }).then(function(){
        vm.texto = "";
        newComentsVisible();
      });

    }

    function returnTramites() {
      $location.path('/tramites');
      location.href = $location.absUrl();
    }

    vm.returnMisTramites = returnMisTramites;
    function returnMisTramites() {
      $location.path('/misTramites');
      location.href = $location.absUrl();
    }
    

    function newComentsVisible() {
      var divComent = document.getElementById('comentariosTramite');
      divComent.scrollTop = '9999';
    }



    function editComment( comment, key ) {
      vm.commentEdit = comment;
      vm.keyComment = key;
      vm.modalEditComment = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/editComment.modal.html',
          scope: $scope,
          size: 'uc',
          backdrop: 'static'
        });
    }

    function updateComment() {
      fecha = getDate();
      fire.ref('rh/tramitesProceso/' + localStorage.getItem("key") + '/comentarios/' + vm.keyComment).update({
        'comentario': vm.commentEdit,
        'fecha': fecha
      });
      vm.modalEditComment.dismiss();
    }

    function deleteComment( key ) {
      swal({
        title: '¿Esta seguro?',
        text: "Realmente desea eliminar el comentario",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then(function () {
        fire.ref('rh/tramitesProceso/' + localStorage.getItem("key") + '/comentarios/' + key ).remove().then(function(){
          swal(
            '¡Borrado!',
            'El comentario ha sido borrado',
            'success'
          )
        });
      });

    }

    vm.updateStatus = updateStatus;
    function updateStatus( level ) {
      var updates = {};
      switch (level) {
        case "1":
          updates['rh/tramitesProceso/' + localStorage.getItem("key") + '/estatus'] = 1;
          break;
        case "2":
          updates['rh/tramitesProceso/' + localStorage.getItem("key") + '/estatus'] = 2;
          break;
        case "3":
          updates['rh/tramitesProceso/' + localStorage.getItem("key") + '/estatus'] = 3;
          break;
      }

        fire.ref().update(updates).then(function(){
          swal(
            '¡Actualizado!',
            'El estatus ha sido cambiado',
            'success'
          )
        });
    }

    /* borrar un archivo que se haya subido en un tramite en proceso */
    function borrarArchivo( nombre, key ) {
      swal({
        title: '¿Estas seguro?',
        text: "¡El archivo sera borrado permanentemente!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then(function () {
         //borra el archivo del storage
        firebase.storage().ref().child(localStorage.getItem("key") + '/' + nombre).delete().then(function() {
          //borrar el registro del documento en la base de datos
          firebase.database().ref('rh/tramitesProceso/' + localStorage.getItem("key") +'/archivos/' + key).remove().then(function(){
            swal('Eliminado!', 'Eliminacion exitosa!', 'success');
          });
        }).catch(function(error) {
            swal('Error!', 'No se pudo eliminar el archivo!', 'error');
        });        
      });  
    }

    /* descargamos un archivo de algun tramite en proceso */
    function downloadFile( urlFile ) {
      $window.open(urlFile, '_blank');
    }

    /* validar campo de nuevo comentario en detalles de un tramite en proceso(solo letras y numeros) */
    function validateComments( cadena ) {
      var patron = /^[a-zñA-ZÑ\s0-9]*$/;
      if(cadena.search(patron))
      {
        vm.texto = cadena.substring(0, cadena.length-1);
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
