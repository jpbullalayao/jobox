// Pointers to Firebase
var database = firebase.database();
var storage = firebase.storage();
var storageRef = storage.ref();

var app = angular.module('starter', ['ionic', 'ngFileUpload', 'mcwebb.twilio', 'mcwebb.twilio-verification'])

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

// App Configuration
app.config(function($stateProvider, $urlRouterProvider, TwilioProvider, TwilioVerificationProvider) {
  
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

  TwilioProvider.setCredentials({
    accountSid: 'ACaaba55352eb370d9184a459468e1246e',
    authToken: '02d0b2a4f8c33fa54c71b2a33ee6ebd9'
  });

  TwilioVerificationProvider.setFromNumber('+14082148498');
});


/**
 * TechController
 *
 * Object that contains all the functionality related to technicians.
 *
 * @param $scope
 * @param $state
 * @param $stateParams
 */
var TechController = function($scope, $state, $stateParams) {

  this.photo = '';
  this.techniciansRef = database.ref('technicians');
  this.techniciansSnapshot = {};
  this.userAuthenticated = true;
  $scope.foundTechnician = $stateParams.technician;

  $scope.techniciansArray = [];

  this.techniciansRef.once('value').then(function(snapshot) {
    this.techniciansSnapshot = snapshot;

    snapshot.forEach(function(childSnapshot) {
      $scope.techniciansArray.push(childSnapshot.val());
    });
  });

  /**
   * updatePhoto()
   *
   * Update front-end of photo container to show the photo that user uploaded when adding a technician.
   *
   * @param photo
   */
  this.updatePhoto = function(photo) {
    this.photo = photo;
  };

  /**
   * saveTechnician()
   *   
   * Save technician information into Firebase 'technicians' table
   *
   * @param technician
   */
  this.saveTechnician = function(technician) {
    // Save Technician in Firebase
    var photo = technician.photo
    technician.photo = null;
    var newTechnician = database.ref('/technicians').push(technician);
    var photoRef = storageRef.child(photo.$ngfName);
    var uploadTask = storageRef.child('images/' + newTechnician.path.o[1]).put(photo);
  };

  /**
   * findTechnician()
   *
   * Looks through snapshot of Firebase table 'technicians' to see if a technician already exists with the
   * specified number. If technician exists, get that technician's information.
   *
   * @param technician
   */
  this.findTechnician = function(technician) {
    this.techniciansRef.orderByChild('phone').equalTo(technician.phone).once('value').then(function(snapshot) {

      snapshot.forEach(function(childSnapshot) {
        $scope.foundTechnician = childSnapshot.val();
        storage.ref('images/' + childSnapshot.key).getDownloadURL().then(function(url) {
          $scope.foundTechnician.photo = url; 
        });

        if ($scope.foundTechnician) {
          $state.go('foundTechnician', { 
            technician: $scope.foundTechnician
          });
        };
      });
    });
  };
};

/**
 * TwilioController
 *
 * Object that contains all functionality related to Twilio.
 *
 * @param Twilio
 * @param TwilioVerification
 */
var TwilioController = function(Twilio, TwilioVerification) {
  this.phone = '';
  this.userAuthenticated = false;

  /**
   * sendSMS()
   *
   * Sends a verification code to the specified phone number.
   *
   * @param phone 
   */
  this.sendSMS = function(phone) {
    TwilioVerification.sendCode('+1' + phone)
    .then(function () {
    
    }, function (response) {

    })
  };

  /**
   * verifySMS()
   * 
   * Takes the specified verification code and verifies user if it is correct.
   *
   * @param verificationCode
   */
  this.verifySMS = function (verificationCode) {
    var verified = TwilioVerification.verifyCode(verificationCode);
    if (verified) {
      this.userAuthenticated = true
    } else {

    }
  };
};

// Controller Injections
TechController.$inject = ['$scope', '$state', '$stateParams'];

// Controllers 
app.controller('TechController', TechController);
app.controller('TwilioController', TwilioController);
