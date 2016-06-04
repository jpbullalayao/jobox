// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var database = firebase.database();
var storage = firebase.storage();
var storageRef = storage.ref();

var app = angular.module('starter', ['ionic', 'ngFileUpload'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('index', {
    url: '/',
    templateUrl: 'index.html'
  })
  
  .state('addTechnician', {
    url: '/add-technician',
    templateUrl: 'add_technician.html'
  })

  .state('foundTechnician', {
    url: '/found-technician',
    templateUrl: 'found_technician.html',
    params: {
      technician: null
    }
  })

  .state('technicians', {
    url: '/technicians',
    templateUrl: 'technicians.html'

  })

  .state('findTechnician', {
    url: '/find-technician',
    templateUrl: 'find_technician.html'
  });

  $urlRouterProvider.otherwise('/add-technician')
});

// Controller Declarations
var TechController = function($scope, $state, $stateParams) {

  console.log($stateParams);

  this.photo = '';
  this.techniciansRef = database.ref('technicians');
  this.techniciansSnapshot = {};
  this.userAuthenticated = true;
  this.foundTechnician = $stateParams.technician;

  $scope.techniciansArray = [];

  this.techniciansRef.once('value').then(function(snapshot) {
    this.techniciansSnapshot = snapshot;

    snapshot.forEach(function(childSnapshot) {
      $scope.techniciansArray.push(childSnapshot.val());
    });
  });

  this.updatePhoto = function(photo) {
    this.photo = photo;
  };

  this.saveTechnician = function(technician) {
    // Save Technician in Firebase
    var photo = technician.photo
    technician.photo = null;
    var newTechnician = database.ref('/technicians').push(technician);
    var photoRef = storageRef.child(photo.$ngfName);
    var uploadTask = storageRef.child('images/' + newTechnician.path.o[1]).put(photo);
  };

  this.findTechnician = function(technician) {
    this.techniciansRef.orderByChild('phone').equalTo(technician.phone).once('value').then(function(snapshot) {

      snapshot.forEach(function(childSnapshot) {
        this.foundTechnician = childSnapshot.val();
      });

      if (this.foundTechnician) {
        $state.go('foundTechnician', { 
          technician: this.foundTechnician
        });
      };
    });
  };
};

TechController.$inject = ['$scope', '$state', '$stateParams'];

// Controllers 
app.controller('TechController', TechController);
