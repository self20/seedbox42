app.directive('contentItem', function ($compile, RequestHandler, $rootScope, $location, socket, $state) {

    var linker = function (scope, element, attrs) {

        scope.messages = [];
        scope.newMessage = "";

        RequestHandler.get("/app/views/partials/" + scope.content.template + ".html")
            .then(function(resultTemplate){
                if (scope.content.name == "minichat"){
                    socket.emit("chat:get:message", null, function(data){
                		scope.messages = data.message;
                        element.html(resultTemplate.data).show();
                        $compile(element.contents())(scope);
                	});
                }else{
                    RequestHandler.get(api + "dashboard/" + scope.content.name)
                		.then(function(result){
                            if (result.status == 200 && resultTemplate.status == 200){

                                switch(scope.content.template) {
                                    case "dashboard-fileList":
                                        scope.files = result.data.data;
                                        $rootScope.tools.convertFields(scope.files);
                                        break;
                                    case "dashboard-chart-donut":
                                        scope.chartData = [
                                          {label: "Free space", value: result.data.data.freePer},
                                          {label: "Used space", value: result.data.data.usedPer},
                                        ];
                                        scope.myFormatter = function(input) {
                                          return input + '%';
                                        };
                                        break;
                                }

                                element.html(resultTemplate.data).show();
                                $compile(element.contents())(scope);
                            }
                		});
                }
            });


        scope.openFile = function(file){
    		$location.url('seedbox/file/' + file._id);
    	};
        scope.sendMessage = function(){
            if (scope.newMessage != "")
    		      socket.emit("chat:post:message", {message: scope.newMessage, id:$rootScope.user._id});
    		scope.newMessage = "";
    	};
        socket.on("chat:post:message", function(data){
    		scope.messages.push(data.newmessage);
    	});
        scope.viewAll = function(nameSort){
    		$state.go("seedbox.files", {sort: nameSort});
    	};
    };

    return {
        restrict: 'E',
        link: linker,
        scope: {
            content: '='
        }
    };
});
