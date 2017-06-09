'use strict';

angular.module('proyectorhApp')
  .controller('registerUserCtrl',['$location', '$scope', '$rootScope', '$uibModal',
    function($location, $scope,  $rootScope, $uibModal){

    //variables publicas
    var vm = this;
    vm.fullname="";
    vm.rfc="";
    vm.typeUser="";
    vm.office = "";
    vm.email="";
    vm.password="";
    vm.confirmPassword="";
    vm.user = "";

    //funciones publicas
    vm.registerUser = registerUser;
    vm.registerUserCancel = registerUserCancel;
    vm.openModalregisterUser = openModalregisterUser;

    //funciones privadas
    var user;
    function activate(){
      user = firebase.auth().currentUser;

    }
    activate();

    function registerUser(){
      /*Crea el usuario e inicia */
      firebase.auth().createUserWithEmailAndPassword(vm.email, vm.password).then(function(error) {

        firebase.database().ref('rh/usuarios').push({
          'usuarioNombre' : vm.fullname,
          'usuarioRFC' : vm.rfc,
          'usuarioEmail' : vm.email,
          'usuarioTipo' : vm.typeUser,
          'usuarioOficina' : vm.office,
          'usuarioTramites': vm.user
        });
        vm.modalRegisterUser.dismiss();
        vm.fullname="";
        vm.rfc="";
        vm.typeUser="";
        vm.email="";
        vm.password="";
        vm.confirmPassword="";
        vm.office="";
        vm.user = "";
        swal("Usuario registrado!", "", "success");
      }).catch(function () {
        // var errorCode = error.code;
        // var errorMessage = error.message;
        swal("No se pudo registrar!", "", "error");
      });
    }

    function openModalregisterUser(){
      vm.modalRegisterUser = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/registerUser.modal.html',
          scope: $scope,
          size: 'ru',
          backdrop: 'static'
        });
    }

    function registerUserCancel(){
      vm.modalRegisterUser.dismiss();
      vm.fullname="";
      vm.rfc="";
      vm.typeUser="";
      vm.email="";
      vm.password="";
      vm.confirmPassword="";
      vm.user = "";
      vm.office = "";
    }
  }]);
