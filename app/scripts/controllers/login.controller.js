'use strict';

angular.module('proyectorhApp')
  .controller('loginCtrl',['$location', '$scope', '$rootScope', '$uibModal',
    function($location, $scope,  $rootScope, $uibModal){

    //variables publicas
    var vm = this;
    vm.email = "";
    vm.password = "";
    vm.emailResetPassword = "";

    //funciones publicas
    vm.iniciarSesion = iniciarSesion;
    vm.resetPassword = resetPassword;
    vm.openModalResetPassword = openModalResetPassword;
    vm.returnLogin = returnLogin;

    //funciones privadas
    function activate(){

    }
    activate();

    function iniciarSesion(){
      firebase.auth().signInWithEmailAndPassword(vm.email, vm.password).then(function(){

        $location.path('/tramites');
        location.href = $location.absUrl();
        console.log("Login correcto");

      }).catch(function(error) {
        // Handle Errors here.

        swal("Datos invalidos!", "", "error");

        // openModal();
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("Inicio incorrecto");
        // ...
      });
    }

    function resetPassword(){
      var auth = firebase.auth();
      var emailAddress = "user@example.com";
      auth.sendPasswordResetEmail(vm.emailResetPassword).then(function() {
        swal("¡Correo enviado!", "Se le enviara un correo en donde podra ingresar una nueva contraseña", "success");
        vm.emailResetPassword = "";
      }, function(error) {
        swal("¡Correo enviado!", "Se le enviara un correo en donde podrá ingresar una nueva contraseña", "error");
      });
    }

    function openModalResetPassword(){
      vm.modalResetPassword = $uibModal.open({
          animation: true,
          templateUrl: 'views/modals/resetPassword.modal.html',
          scope: $scope,
          size: 'rp',
          backdrop: 'static'
        });
    }

    function returnLogin(){
      $location.path('/login');
      location.href = $location.absUrl();
      vm.emailResetPassword = "";
    }

  }]);
