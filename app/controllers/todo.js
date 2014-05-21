/*
 * ToDoh - Another To Do Application.
  Why? To test AppGyver Steroids!
  Why ToDo? Cuz I already have and ToDo App in android. So why not have one in
            HTML5?

  Technologies: AngularJS         - https://angularjs.org/
                Ionic Framework   - http://ionicframework.com/
                AppGyver Steroids - http://www.appgyver.com/

  GitHub: https://github.com/felipew/toDoh_HTML5
  Twitter: www.twitter.com/felipewagnr

  TODO:
    Android:
      Behavior on android 4.4 isn't OK - Loading screen freeze on top.

    Generic:
      Change layout to use checkbox to mark as done.
      Add Grunt Task: Build system automagically update version 0.0.X.REVISION

 */

// Initialize app and modules.
var todoApp = angular.module('todoApp', ['TodoModel', 'ngTouch']);
var appVersion = "0.0.2"; // App version. 

// Global.
var data = {}; // initialize data

// Index: http://localhost/views/todo/index.html
todoApp.controller('IndexCtrl', function ($scope, TodoRestangular) {

  // Preload View, to avoid the LOADING screen.
  var addView = new steroids.views.WebView("/views/todo/add.html");
  addView.preload();

  // Associate the data with the local scope
  $scope.todos = data;

  // Remove TODO from the list
  $scope.remove = function(id){
    delete data[id];
    window.localStorage.setItem("toDoh",JSON.stringify(data));
  }

  // Check todo as done
  $scope.done = function(id){
    data[id].done = !data[id].done;
    window.localStorage.setItem("toDoh",JSON.stringify(data));
  }

  // DEBUG ONLY
  // Generate some data and save it
  $scope.reset = function(){
    var id = new Date().getTime();
    data[id] = {
        "id":id,
        "nome":"My First Task",
        "done":false
    };
    data[id+1] = {
        "id":id+1,
        "nome":"My Second Task",
        "done":true
    }

    window.localStorage.setItem("toDoh",JSON.stringify(data));
    $scope.todos = data;
  }
  // END DEBUG /////////////////////////////////////////////////////////////////

  // Handler the add click
  $scope.add = function() {
    // steroids.modal.show(addView);
    steroids.layers.push(addView);
  }

  
  $scope.refresh = function() {
    // Load the data from the local storage.
    data = JSON.parse(window.localStorage.getItem("toDoh")) || {};
    $scope.todos = data; // re-assign the data to the scope
    // Since refresh is called outside angular context we need to manually call
    // the apply method to force the DOM update.
    $scope.$apply();
  }

  // Clear completed itens from the list/store and view
  $scope.clear = function() {
    var oldTodos = $scope.todos; // get all todos
    $scope.todos = {};           // reset the scope

    angular.forEach(oldTodos,function(todo){
      if(!todo.done) {                // if isn't done
        $scope.todos[todo.id] = todo; // store it
      }
    });

    data = $scope.todos; // copy to the local data.
    window.localStorage.setItem("toDoh",JSON.stringify(data)); // store

    // Since refresh is called outside angular context we need to manually call
    // the apply method to force the DOM update.
    // more info: $watch $apply and $digest
    $scope.$apply();
  }
  

  // Interface creation
  // Here we will create the navbar and buttons
  // Android: The navbar isn't working in android. 
  //
  // CREATING BUTTON ///////////////////////////////////////////////////////////
  var rightButton = new steroids.buttons.NavigationBarButton();
  rightButton.title = "Add";
  rightButton.onTap = function(){
	 $scope.add();
  }

  var leftButton = new steroids.buttons.NavigationBarButton();
  leftButton.title = "Clear";
  leftButton.onTap = function(){
	 $scope.clear();
  }
  // END CREATING BUTTON ///////////////////////////////////////////////////////

  // Set title and show
  steroids.view.navigationBar.show("toDoh");
  steroids.view.navigationBar.setButtons({
    left:   [leftButton],
    right:  [rightButton]
  });
  // End of Interface //////////////////////////////////////////////////////////

  // Load the data
  data = JSON.parse(window.localStorage.getItem("toDoh")) || {};

  // Put on local scope, so the interface could read it.
  $scope.todos = data;

  // Listener to receive messages from our add controller
  window.addEventListener("message", messageReceived);
  function messageReceived(event){
    // ATENTION: Assuming we only receive messages to update the View.
    // So, if the message is comming directly to us, we should refresh the view.
    if( event.data.recipient == "IndexCtrl") { 
      $scope.refresh();   // refresh it !
    }
  }
});

// Show: http://localhost/views/todo/add.html
todoApp.controller('AddCtrl', function ($scope, $filter, TodoRestangular) {
  $scope.close = function(){
    // steroids.modal.hide();
    steroids.layers.pop();
  }
  $scope.add = function() {
    // Get current local storage
    data = JSON.parse(window.localStorage.getItem("toDoh")) || {}; // load data

    var tmp = getNewTodoItem($scope.newItem); // create new item
    data[tmp.id] = tmp;                       // insert in the local storage

    // steroids.modal.hide();  // hide the modal
    steroids.layers.pop();  // back to the last webview

    // save the new data in the localStorage
    window.localStorage.setItem("toDoh",JSON.stringify(data)); 

    $scope.newItem = ""; // clear input field
	

    message = {
      recipient: "IndexCtrl",
      message: "update" // will use in a far far away future.
    }

    // This will sent the message to every opened WebView
    window.postMessage(message); // send message using the postMessage API

  }

  $scope.newItem = ""; // clear input field
});

todoApp.controller('AboutCtrl', function ($scope) {
  $scope.twitter = function(){
    steroids.openURL("twitter:///user?screen_name=felipewagnr");
  }

  $scope.version = appVersion; // Version of the application
});

steroids.view.navigationBar.show("toDoh");
steroids.view.setBackgroundColor("#FFFFFF");

// helper functions
// generate a JSON with a new TODO
function getNewTodoItem(todo) {
  var id = new Date().getTime();
  return {
    "id":id,
    "nome":todo,
    "done":false
  }
}