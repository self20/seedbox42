var app = angular.module('seedApp', [
    'ngRoute',
    'ngSanitize',
    'ui.router',
    'ngCookies',
    'ngVideo',
    'ngFileUpload',
    'bootstrapLightbox',
    'angular.morris-chart',
    'luegg.directives',
    'com.2fdevs.videogular',
    'xeditable',
    'ui.bootstrap.contextMenu',
	'angular-clipboard',
    'toaster',
    'ngAnimate',
    'ui.sortable',
    'scroll'
]);

// ---------------------- variable global -------------------------------
var api = "";
var roles = {
    "1" : "user",
    "0": "admin",
};

app.run(function ($rootScope, $location, $http, $state, $timeout, Tools, editableOptions, editableThemes, socket) {

    api = "/";

    editableThemes.bs3.inputClass = 'input-sm xeditable-input';
    editableThemes.bs3.buttonsClass = 'btn-sm';
    editableOptions.theme = 'bs3';

    $rootScope.tools = {
        convertFields: function(list){
            angular.forEach(list, function(value, key){
                res = value.fileType.split("/");
                value.type = res[0];
                value.sizeConvert = Tools.FileConvertSize(value.size);
            });
        },
        backPage: function(){
            if ($rootScope.states.from.name != "")
                $state.go($rootScope.states.from.name);
        }
    };

    $rootScope.$on('filesLoaded', function () { //ajout
        $timeout(function () {
            // console.log('onononononononon');
            $('.stars').stars();
        }, 0, false);
    });

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
        console.log('stateChangeError');
        console.log(event, toState, toParams, fromState, fromParams, error);

        if (error == "badConnection")
            $state.go("connexion");
    });


    // gestion des droits d'access aux url
    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

        $rootScope.states = {
            to: toState,
            from: fromState
        };

        if (fromState.controller == "torrentsCtrl")
            socket.emit('torrentStopRefresh');

        function wait (){
            if ("user" in $rootScope && "role" in $rootScope.user){
                if ("access" in toState){
                    for (var key in toState.access){
                        if (key == $rootScope.user.role){
                            return;
                        }
                    }
                    event.preventDefault();
                    if (fromState.name != "^"){
                        $location.url(fromState.url);
                    }else{
                        $location.url('seedbox/dashboard');
                    }
                }
            }else{
                $timeout(wait, 500)
            }
        };

        wait();

    });

});
