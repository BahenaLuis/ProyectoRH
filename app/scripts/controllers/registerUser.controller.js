'use strict';

angular.module('proyectorhApp')
  .controller('registerUserCtrl',['$location', '$scope', '$rootScope', '$uibModal',
    function($location, $scope,  $rootScope, $uibModal){

    //variables publicas
    var vm = this;
    vm.fullname="";
    vm.rfc="";
    vm.typeUser="";
    vm.email="";
    vm.password="";
    vm.confirmPassword="";

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
        vm.modalRegisterUser.dismiss();
        vm.fullname="";
        vm.rfc="";
        vm.typeUser="";
        vm.email="";
        vm.password="";
        vm.confirmPassword="";
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
    }


  }]);
