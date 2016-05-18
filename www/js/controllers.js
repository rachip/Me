var widthArr = [60, 40, 50];
var loginUserType;
var TheBranchName;
localStorage.setItem("isLoggedin", "false");
localStorage.setItem('msNum', 0);

angular.module('starter.controllers', ['firebase', 'ngSanitize'])

.controller('AuthCtrl', function($scope, $ionicConfig) {

})

// APP
.controller('AppCtrl', function($scope, $location, $state, $ionicConfig, $rootScope, $http, $ionicPopup) {

	$scope.selectChat = function() {
		//console.log('click chat ' + $rootScope.propertyCnt);
		$state.go('chatMain');
	}  
})

// Invest
.controller('InvestCtrl', function($scope, $state) {
	
	$scope.sideMenuNavigation = function() {
		if(localStorage.getItem("email") != null) {
			$state.go('app.overview');
		} else
			$state.go('auth.main');
	}  
})

//LOGIN
.controller('LoginCtrl', function($scope, $rootScope, $http, $state, $location) {

	$scope.loginClick = 0;
	$scope.errorLogin = 0;

	$scope.updateMe = function() { 
		$scope.loginClick = 1;
    };
    
    $scope.investMe = function() {
	    $state.go('invest.marketing');
    };

    $scope.userDetail = {};
	
	if(localStorage.getItem("email") != null) {
		$scope.userDetail.email = localStorage.getItem("email");
		$scope.userDetail.password = localStorage.getItem("password");
	}

	$scope.submit = function() {
	$scope.isLogin = true;
	   $http({
		    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Login', 
		    method: "POST",
		    data:  {mail:$scope.userDetail.email,
		    	    password:$scope.userDetail.password}, 
		    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		    
		}).then(function(resp) {
			if(resp.data == "false") {
				$scope.isLogin = false;	
				$scope.msg = "The Email or Password incorrect";
				$scope.errorLogin=1;
			}
			else {
				localStorage.setItem("loginUserType", resp.data["Type"]);
				if(resp.data["Type"] == "user") {
					loginUserType = "user";
					localStorage.setItem("id", resp.data["UserId"]);
					localStorage.setItem("ClientName", resp.data["ClientName"]);
					localStorage.setItem("isAdmin", resp.data["IsAdmin"]);
					localStorage.setItem("branch", resp.data["BranchId"]);
					localStorage.setItem("email", $scope.userDetail.email);
					localStorage.setItem("password", $scope.userDetail.password);
					localStorage.setItem("isLoggedin", "true");
				}
				else {
					loginUserType = "client";
					localStorage.setItem("id", resp.data["ClientId"]);
					localStorage.setItem("ClientName", resp.data["ClientName"]);
					localStorage.setItem("email", $scope.userDetail.email);
					localStorage.setItem("password", $scope.userDetail.password);
					localStorage.setItem("isLoggedin", "true");
					
					var deviceToken = localStorage.getItem("deviceToken");

					$http({
					    url: 'http://updateme.co.il/index.php/api/Login/setDeviceToken', 
					    method: "POST",
					    data:  {Userid: resp.data["ClientId"],
					    DeviceToken: deviceToken,
					    IsconnectToApp: 1}, 
					    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					    
					}).then(function(resp) {

						//console.log(resp);

						});
				}
				$scope.isLogin = false;	
				$state.go('app.overview');
			}
		
		}, function(err) {
			$scope.isLogin = false;	
		    $scope.msg = err;
		    console.error('ERR', err);
		})
    };
})

//Marketing Ctrl - show all marketing properties per branch
.controller('MarketingCtrl', function($scope, $http, $state, $rootScope, $timeout, $q)  {
    
	var rndval;
	var rndvalKodem = 0;
	var i = 0;
	var $x;
	$scope.selectedBranch = "";
	$scope.showRochester = 1;
	$scope.showCleveland = 1;
	$scope.showColumbus = 1;
	$scope.showJacksonviller = 1;	
	$rootScope.isRouteLoading = true;

	var promise = getProperties($scope, $http, $q);
	promise.then(function() {
	}, function() {
		alert('Failed: ');
	});
	
	$scope.seeMore = function(branchId) {		
		$scope.selectedBranch = branchId;
		$timeout(function() {
			$('.scroll').css('transform', 'translate3d(0px, 0px, 0px) scale(1)');
		});		
	};
	
	$scope.back = function() {
		$scope.selectedBranch = "";
	}
	
	$scope.marketingDetails = function(propertyId, propertyName) {	
		$state.go('invest.marketingDetails');
		$timeout(function() {
	    	var unbind = $rootScope.$broadcast( "marketingDetails", {marketingPropertyId:propertyId, marketingPropertyName: propertyName} );
	    });
	};
})

//MarketingDetailsCtrl ctrl
.controller('MarketingDetailsCtrl', function($scope, $http, $rootScope, $sce, $ionicScrollDelegate, $cordovaSocialSharing, $ionicPopup, $q) {
	var propertyName;
	$scope.MailObj = {};
	$scope.moreTextPS; //Property Summary
	$scope.moreTextIS; //Investment Summary
	$scope.moreTextMS; //Market Summary
	$scope.moreTextRS; //Rating Summary
	$scope.moreTextES; //Entrepreneur Summary
	$scope.offsetHeightPS;
	$scope.offsetHeightIS;
	$scope.offsetHeightMS;
	$scope.offsetHeightRS;
	$scope.offsetHeightES;
	
	$scope.requiredUser = false;
	$scope.requiredMail = false;
	$scope.validMail = false;	
	
	$scope.deliberatelyTrustDangerousSnippet = function(divId, text, section) {	
		if(document.getElementById(divId).offsetHeight > 100) {			
			$scope['moreText' + section] = true;
			$scope['offsetHeight' + section] = document.getElementById(divId).offsetHeight;
			$("#"+divId).addClass('height_100px');
			document.getElementById(divId).style.overflow = "hidden";
		}
		return $sce.trustAsHtml(text);
    };
    
    $scope.moreTextClick = function(parentDivId, showMoreDiveId, section) {
    	if($("#"+showMoreDiveId).text() == "Show More") {
    		$("#"+parentDivId).animate({height:$scope['offsetHeight' + section]}, 1000);
    		$("#"+showMoreDiveId).text("Show Less");
    	}
    	else {
    		$("#"+parentDivId).animate({height:'100'}, 1000);
    		$("#"+showMoreDiveId).text("Show More");
    		$scope['moreText'+ section] = false;
    	}
    }
	
	$rootScope.isMarketingDetailsLoading = true;
	
	$scope.$on( "marketingDetails", function(event, data) {
		propertyId = data.marketingPropertyId;
		propertyName = data.marketingPropertyName; 
		var promise = getMarketingDetailsPageData(propertyId, $scope, $rootScope, $http, $q);
		promise.then(function() {
		}, function() {
			alert('Failed: ');
		});			
	});
	
	$scope.share = function(propID) {
        var isLoggedin = localStorage.getItem("isLoggedin");
       
        //console.log("propId : " + propID);

        if (isLoggedin == "true") {
        	var uri = "http://www.me-realestate.com/?page_id=499&prop=" + propID; 
        	var massage = localStorage.getItem("ClientName") + " wanted to share with you a very interesting investment he thought you might be interested in and grant you with a 5% discount. coupon code: " + localStorage.getItem("id");
        	var title = localStorage.getItem("ClientName") + " shared an investment with you";
        	$cordovaSocialSharing.share(massage, title, null, uri)
        }
        else {
        	var uri = "http://www.me-realestate.com/?page_id=499&prop=" + propID; 
        	$cordovaSocialSharing.share(null, "A dream investment", null, uri)
        }
	}
	
	$scope.buy = function() {
		$ionicScrollDelegate.scrollBottom();
		$scope.sendMail = 1;
	};
	
	$scope.meeting = function() {
		$ionicScrollDelegate.scrollBottom();
		$scope.meet = 1;
	};
	
	$scope.closeMailPopup = function() {
		$ionicScrollDelegate.scrollBottom();
		$scope.sendMail = 0;
		$scope.MailObj = {};
		$scope.requiredUser = false;
		$scope.requiredMail = false;
		$scope.validMail = false;
	};
	
	$scope.closeMeetingPopup = function() {
		$ionicScrollDelegate.scrollBottom();
		$scope.meet = 0;
		$scope.MailObj = {};
		$scope.requiredUser = false;
		$scope.requiredMail = false;
		$scope.validMail = false;
	};
	
	$scope.send = function() {
		if($scope.MailObj.name == undefined) {
			$scope.requiredUser = true;
		} else {
			$scope.requiredUser = false;
		}
		if($scope.MailObj.mail == undefined) {
			$scope.requiredMail = true;
		} else {
			var validEmail = validateEmail($scope.MailObj.mail);
			if(!validEmail) {
				$scope.requiredMail = false;
				$scope.validMail = true;
			} else {
				$scope.validMail = false;
				$scope.requiredMail = false;
			}			
		}
		
		if($scope.requiredUser == false && $scope.requiredMail == false && $scope.validMail == false) {
			$ionicScrollDelegate.scrollBottom();	
			$scope.sendMail = 0;
			
			var date = new Date();
			var dd = date.getDate();
			var mm = date.getMonth()+1; //January is 0!
			var yyyy = date.getFullYear();
			var joinDate = yyyy + '-' + mm + '-' + dd;
			
			var obj = {name: $scope.MailObj.name, mail: $scope.MailObj.mail, phone: $scope.MailObj.phone,
					   address: $scope.MailObj.address, schedule: $scope.MailObj.schedule, 
					   bid: $scope.MailObj.bid, propertyName: propertyName, codeCoupon: $scope.MailObj.codeCoupon};
			//console.log('mail', obj);
			
			// send mail to moshe gmail
			$http({
			    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Email/buy', 
			    method: "POST",
			    data: {name: $scope.MailObj.name, email: $scope.MailObj.mail, phone: $scope.MailObj.phone,
					   address: $scope.MailObj.address, schedule: $scope.MailObj.schedule,
					   bid: $scope.MailObj.bid, propertyName: propertyName, codeCoupon: $scope.MailObj.codeCoupon},
			    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).then(function(resp) {
				//console.log("sucess")
			}, function(err) {
			    console.error('ERR', err);
			})	
			
			// save mail details in contacts leads tbl
			$http({
			    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Email/addContactLeads', 
			    method: "POST",
			    data: {name: $scope.MailObj.name, email: $scope.MailObj.mail, phone: $scope.MailObj.phone,
					   address: $scope.MailObj.address, schedule: $scope.MailObj.schedule, 
					   bid: $scope.MailObj.bid, codeCoupon: $scope.MailObj.codeCoupon, joinDate: joinDate},
			    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).then(function(resp) {
				//console.log("sucess")
			}, function(err) {
			    console.error('ERR', err);
			})	
			// set default values for the next time
			$scope.MailObj = {};
			$scope.requiredUser = false;
			$scope.requiredMail = false;
			$scope.validMail = false;
		}
	}
	
	$scope.setMeeting = function() {
		if($scope.MailObj.name == undefined) {
			$scope.requiredUser = true;
		} else {
			$scope.requiredUser = false;
		}
		if($scope.MailObj.mail == undefined) {
			$scope.requiredMail = true;
		} else {
			var validEmail = validateEmail($scope.MailObj.mail);
			if(!validEmail) {
				$scope.requiredMail = false;
				$scope.validMail = true;
			} else {
				$scope.validMail = false;
				$scope.requiredMail = false;
			}			
		}
		
		if($scope.requiredUser == false && $scope.requiredMail == false && $scope.validMail == false) {
			$ionicScrollDelegate.scrollBottom();		
			$scope.meet = 0;
			
			var date = new Date();
			var dd = date.getDate();
			var mm = date.getMonth()+1; //January is 0!
			var yyyy = date.getFullYear();
			var joinDate = yyyy + '-' + mm + '-' + dd;
			
			var obj = {name: $scope.MailObj.name, mail: $scope.MailObj.mail, phone: $scope.MailObj.phone,
					   address: $scope.MailObj.address, schedule: $scope.MailObj.schedule, codeCoupon: $scope.MailObj.codeCoupon,
					   joinDate: joinDate};
			//console.log(obj);
			
			// send mail to moshe gmail
			$http({
			    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Email/setMeeting', 
			    method: "POST",
			    data: {name: $scope.MailObj.name, email: $scope.MailObj.mail, phone: $scope.MailObj.phone,
					   schedule: $scope.MailObj.schedule, propertyName: propertyName, codeCoupon: $scope.MailObj.codeCoupon},
			    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).then(function(resp) {
				//console.log("sucess")
			}, function(err) {
			    console.error('ERR', err);
			})	
			
			// save mail details in contacts leads tbl
			$http({
			    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Email/addContactLeads', 
			    method: "POST",
			    data: {name: $scope.MailObj.name, email: $scope.MailObj.mail, phone: $scope.MailObj.phone,
					   address: '', schedule: $scope.MailObj.schedule, codeCoupon: $scope.MailObj.codeCoupon, joinDate: joinDate},
			    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).then(function(resp) {
				//console.log("sucess")
			}, function(err) {
			    console.error('ERR', err);
			})
			//set default values for the next time
			$scope.MailObj = {};
			$scope.requiredUser = false;
			$scope.requiredMail = false;
			$scope.validMail = false;
		}
	}
})

//Chats Ctrl
.controller('ChatsCtrl', function($scope, NewChatsService, getAllChats, $ionicHistory, $location, $state, $rootScope, $firebaseObject ,$firebaseArray, $ionicScrollDelegate, $rootScope ) { 
	
	$scope.branchToChat = function (BranchName) { 
		TheBranchName = BranchName;	
	 	$scope.chatSelected = false;  
	 	$state.go('app.chats'); 
	} 
	
	var userId = localStorage.getItem("id"); 
	$scope.userId = userId;
	$scope.RochesterChat = check_new_chatc($firebaseObject ,$firebaseArray, "Rochester", userId);
	$scope.ClevelandChat = check_new_chatc($firebaseObject ,$firebaseArray, "Cleveland", userId);
	$scope.ColumbusChat = check_new_chatc($firebaseObject ,$firebaseArray, "Columbus", userId);
	
	$scope.show_chat_bu = true;
	
	$scope.myBackBU = function() {			
		$scope.show_chat_bu = true;
		$ionicHistory.goBack();
	}

  	$scope.chatIsActive = false; 
 
  	$scope.myId = localStorage.getItem("id"); 
 	var userId = localStorage.getItem("id"); 
 
 	var ref = new Firebase("https://updatemeapp.firebaseio.com/messages/" + TheBranchName + "/" + userId); 
 
	ref.limitToLast(1).on("child_added", function(snapshot, prevChildKey) { 
	 	$ionicScrollDelegate.scrollBottom(); 
	 	$ionicScrollDelegate.scrollBottom(); 
 	}); 
 
 	$scope.chats = $firebaseArray(ref); 
 
  	var username = localStorage.getItem("ClientName"); 
  	
  	$ionicScrollDelegate.scrollBottom(); 
   
 	$scope.sendChat = function(chat) { 
   		$scope.chats.$add({ 
 			user: username, 
 			userid: userId, 
 	        message: chat.message, 
 	        client: true, 
 	        timestamp: new Date().getTime() 
 		}); 
 		chat.message = ""; 
 	} 
    
    $scope.isEmpty = function (obj) {
    	//console.log("obj "+ obj);
        if (obj == "") 
        	return false;
        else
        	return true;
    };
}) 

//OverviewProperties Ctrl - logged in user
.controller('OverviewPropertiesCtrl', function($scope, $location, getAllChats, notService, NewChatsService, $http, $location, $ionicPopup, $timeout, $firebaseObject ,$firebaseArray, $rootScope, $state, $q, $ionicScrollDelegate) {
	
	notService.getNewNote();

	$scope.chatsTitle = getAllChats.get();
	
    $scope.msNum = localStorage.getItem('msNum');

    $scope.setNewM = function(num, value) {
		if (value == true) {
			$scope.msNum ++;
		}        
    }
	
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getClientNotification', 
	    method: "GET",
	    params:  { index: localStorage.getItem("id")}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
		
		text = resp.data[0]['Text'];
		NotificationId = resp.data[0]['Id'];
		
		   var alertPopup = $ionicPopup.alert({
			     title: 'New message from ME',
			     template: text
			   });

				$http({
				    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/setClientNotificationStatus', 
				    method: "POST",
				    data: { NotificationId: NotificationId},
				    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				}).then(function(resp) {
					//console.log("sucess")
				}, function(err) {
				    console.error('ERR', err);
				})	

		   
		}    		
	}, function(err) {
	    
	});
		
	$scope.show_chat_bu = true;
		
	$scope.hide_chat_box = function() {			
		$scope.chatSelected = false;			
	}

	$scope.branchToChat = function (BranchName) { 
		TheBranchName = BranchName;	
	 	$scope.chatSelected = false;  
	 	$state.go('app.chats'); 
	} 
	 
	$scope.selectChat = function() { 
 		localStorage.setItem('msNum', 0);
 		 $scope.msNum = localStorage.getItem('msNum');
 
 		if ($rootScope.propertyCnt > 1 ) { 
 			$state.go('app.chatMain'); 
 		} else { 
 			TheBranchName = $rootScope.TheBranchName;
 			$state.go('app.chatMain'); 
 		} 
 	}  		
		
    var id; 
    $scope.isOverviewLoading = true;    
    
    $scope.init = function() {
    	var promise = getOverviewPageData($scope, $rootScope, $http, $q);
		promise.then(function() {
		}, function() {
			alert('Failed: ');
		});
		
		getMainBarValues($scope, $http);
		$ionicScrollDelegate.scrollTop();
    }
    
	$scope.showPropertyDetails = function(propertyId, imageURL) {
		//console.log("showDetails function " + propertyId);
		$state.go('app.propertyDetails');
	    $timeout(function() {
	    	var unbind = $rootScope.$broadcast( "showDetails", {PropertyId:propertyId, ImageURL:imageURL} );
	    });
	};
	
	$scope.gotoMarketing = function(propertyId) {
		$rootScope.marketingPropertyImages = null;
	    $ionicScrollDelegate.scrollTop();
		$state.go('invest.marketingDetails');
		$timeout(function() {
	    	var unbind = $rootScope.$broadcast( "marketingDetails", {marketingPropertyId:propertyId} );
	    });
	};
})

//propertyDetails ctrl
.controller('PropertyDetailsCtrl', function($scope, getAllChats, $location, $firebaseObject ,$firebaseArray, $ionicPopup, $state, $rootScope, $ionicScrollDelegate, $http, $rootScope, 
		$timeout, $q, $ionicPopup, $ionicModal) {
	
	$scope.chatsTitle = getAllChats.get();
	
    $scope.msNum = localStorage.getItem('msNum');

    $scope.setNewM = function(num, value) {
		if (value == true) {
			$scope.msNum ++;
		}        
    }

	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getClientNotification', 
	    method: "GET",
	    params:  { index: localStorage.getItem("id")}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {		
			text = resp.data[0]['Text'];
			NotificationId = resp.data[0]['Id'];
			
			var alertPopup = $ionicPopup.alert({
			    title: 'New message from ME',
			    template: text
		    });
	
			$http({
			    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/setClientNotificationStatus', 
			    method: "POST",
			    data: { NotificationId: NotificationId},
			    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).then(function(resp) {
				//console.log("sucess")
			}, function(err) {
			    console.error('ERR', err);
			})	
		}
	}, function(err) {	    
	});
	
	$scope.hide_chat_box = function() {		
		$scope.chatSelected = false;		
	}

	$scope.branchToChat = function (BranchName) { 
		TheBranchName = BranchName;	
	 	$scope.chatSelected = false;  
	 	$state.go('app.chatMain'); 
	} 
 
	$scope.selectChat = function() { 
 		localStorage.setItem('msNum', 0);
 		 $scope.msNum = localStorage.getItem('msNum');
 		if ($rootScope.propertyCnt > 1 ) { 
 			$state.go('app.chatMain'); 
 		} else { 
 			TheBranchName = $rootScope.TheBranchName;
 			$state.go('app.chatMain'); 
 		} 
 	}  
	
	$scope.showMaintenance = 0;
	$scope.showPurchase = 0;
	$scope.showClosing = 0;
	$scope.showRenovation = 0;
	$scope.showLeasing = 0;
	$scope.showOccupied = 0;
	$scope.showEviction = 0;
	
	$scope.requestPopup = 0;
	$scope.Info = {};
	
	$rootScope.isPropertyDetailsLoading = true;
	
	var propertyId;
	$scope.$on( "showDetails", function(event, data) {
		propertyId = data.PropertyId;	
		var promise = getOverviewDetailsPageData(propertyId, $scope, $http, $q);
		promise.then(function() {
		}, function() {
			alert('Failed: ');
		});			
	});
	
	$ionicModal.fromTemplateUrl('my-modal.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	  });
	  $scope.openModal = function(typeId) {
		  //var ref = cordova.InAppBrowser.open('http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/uploads/thumb_14626903231450773143download.jpg', '_blank', 'location=yes');

		 $scope.modal.show();			  
		  $http({
			    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/GetFiles/getPropertyFile', 
			    method: "GET",
			    params:  {propertyId: propertyId, typeId: typeId}, 
			    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			}).then(function(resp) {
				if (resp.data.length != 0) {					
					$scope.sliderImg = resp.data;
				} 		
			}, function(err) {
			    console.error('ERR', err);
			})
	  };
	  $scope.closeModal = function() { 
		  $scope.sliderImg = null;
		  $scope.modal.hide();
	  };
	  // Cleanup the modal when we're done with it!
	  $scope.$on('$destroy', function() {
	    $scope.modal.remove();
	  });
	  // Execute action on hide modal
	  $scope.$on('modal.hidden', function() {
	    // Execute action
	  });
	  // Execute action on remove modal
	  $scope.$on('modal.removed', function() {
	    // Execute action
	  });
	
	$scope.click = function(section) {		
		switch(section){
			case 0:
				$scope.showMaintenance = ($scope.showMaintenance) ? 0 : 1;
				$scope.showUpdateClientMaintenance = false;
				updateClientRead($http, propertyId, 'Maintenance');
				break;
			case 1:
				$scope.showPurchase = ($scope.showPurchase) ? 0 : 1;
				$scope.showUpdateClientPurchase = false;
				updateClientRead($http, propertyId, 'PurchaseAndSale');				
				break;
			case 2:
				$scope.showClosing = ($scope.showClosing) ? 0 : 1;
				$scope.showUpdateClientClosing = false;
				updateClientRead($http, propertyId, 'Closing');
				break;
			case 3:
				$scope.showRenovation = ($scope.showRenovation) ? 0 : 1;
				$scope.showUpdateClientRenovation = false;
				updateClientRead($http, propertyId, 'Renovation');
				break;
			case 4:
				$scope.showLeasing = ($scope.showLeasing) ? 0 : 1;
				$scope.showUpdateClientLeasing = false;
				updateClientRead($http, propertyId, 'Leasing');
				break;
			case 5:
				$scope.showOccupied = ($scope.showOccupied) ? 0 : 1;
				$scope.showUpdateClientOccupied = false;
				updateClientRead($http, propertyId, 'Occupied');
				break;
			case 6:
				$scope.showEviction = ($scope.showEviction) ? 0 : 1;
				$scope.showUpdateClientEviction = false;
				updateClientRead($http, propertyId, 'Eviction');
				break;
		}		
	};
	
	$scope.requestInfo = function() {
		$ionicScrollDelegate.scrollBottom();		
		$scope.requestPopup = 1;
		$('#requestInfo').removeClass('fadeOut').addClass('fadeIn');		
		$('input[type=checkbox]').removeAttr('checked');
	};
	
	showAlert = false;
	$scope.sendRequestInfo = function() {
		$ionicScrollDelegate.scrollTop();		
		for(var i in $scope.Info) {
			if($scope.Info[i]) {
				showAlert = true;
				$http({
		    	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/RequestUpdate', 
		    	    method: "GET",
		    	    params:  { id:propertyId, table:i }, 
		    	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		    	}).then(function(resp) {
		    		console.log("sucess request update");
		    	}, function(err) {
		    	    console.error('ERR', err);
		    	})
			}
		}
		
		$('#requestInfo').removeClass('fadeIn').addClass('fadeOut');		
		$timeout(function() {					
			$scope.requestPopup = 0;
			$scope.Info = {};
		});	
		
		if(showAlert) {
			var alertPopup = $ionicPopup.alert({
			     title: 'Update ME',
			     template: 'Your request for update was sent to the office'
			   });
			   alertPopup.then(function(res) {
			     //console.log('Thank you for not eating my delicious ice cream cone');
			   });
			showAlert = false;
		}
	};
	
	$scope.closePopup = function() {
		$scope.requestPopup = 0;
		$ionicScrollDelegate.scrollTop();
	};
})

.controller('DashCtrl', function($scope) {})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

function getPropertyImage(propertyId, $scope, $http) {	
	//console.log("getPropertyImage function" + propertyId);
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PropertyImage/getAllPropertyImages', 
	    method: "GET",
	    params:  {PropertyId: propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$scope.allImages = resp.data;			
		} 		
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getPropertyChart(propertyId, $scope, $http) {
	//console.log("getPropertyChart function" + propertyId);
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Property/getPropertyROIChartAPI', 
	    method: "GET",
	    params:  {index: propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.propertyChart = resp.data[0];
			
			var totalReturn = parseFloat(resp.data[0]['TotalReturn']);
			var investmentAmount = parseFloat(resp.data[0]['InvestmentAmount']);
			var dbDate = resp.data[0]['InvestmentDate'];
			
			var today = new Date();
			var date = (dbDate != "0000-00-00") ? new Date(dbDate) : new Date();
			
			var months;
		    months = (today.getFullYear() - date.getFullYear()) * 12;
		    months -= date.getMonth() + 1;
		    months += today.getMonth();
		    $scope.month = months <= 0 ? 0 : months;
 
		    
		    $scope.currentYield = ($scope.month && investmentAmount) ? Math.round(totalReturn / $scope.month * 12 / investmentAmount * 100) : 0;
			var val = (investmentAmount != 0) ? totalReturn / investmentAmount * 100 : 0;
			
			$scope.propertyChart.InvestmentAmount = numberWithCommas($scope.propertyChart.InvestmentAmount);
			$scope.propertyChart.TotalReturn = numberWithCommas($scope.propertyChart.TotalReturn);
			
			// bar
			var div2 = d3.select(document.getElementById('div2'));
			start();

			function onClick1() {
			    deselect();
			}

			function labelFunction(val,min,max) {

			}

			function deselect() {
			    //div1.attr("class","radial");
			}

			function start() {
				$('.label').val("sghdsfhsdf");
			    var rp1 = radialProgress(document.getElementById('div2'))
			            .label("ROI")
			            .onClick(onClick1)
			            .diameter(120)
			            .value(val)
			            .render();
			}
		} 		
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getMaintenanceDetails(propertyId, $scope, $http) {	
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Maintenance', 
	    method: "GET",
	    params:  {index: propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.maintenance = resp.data[0];
			//console.log($scope.maintenance);
			
			$scope.maintenance['Date'] = dateFormat($scope.maintenance['Date']);
			$scope.maintenance['CompleteDate'] = dateFormat($scope.maintenance['CompleteDate']);
			/*$scope.purchaseAndSale['ClosignDate'] = dateFormat($scope.purchaseAndSale['ClosignDate']);
			$scope.purchaseAndSale['Closed'] = dateFormat($scope.purchaseAndSale['Closed']);
			
			$scope.isHasPurchaseFile = $scope.purchaseAndSale['IsHasFile'] == 1 ? true : false;
			$scope.IsBuyerFile = $scope.purchaseAndSale['IsBuyerFile'] == 1 ? true : false;
			$scope.IsSignedDocsFile = $scope.purchaseAndSale['IsSignedDocsFile'] == 1 ? true : false;
			$scope.IsBalanceFile = $scope.purchaseAndSale['IsBalanceFile'] == 1 ? true : false;
			$scope.IsFilesTo = $scope.purchaseAndSale['IsFilesToS‌ignFile'] == 1 ? true : false;
			$scope.showPurchaseNote = $scope.purchaseAndSale['ShowNote'] == 1 ? true : false;*/
			if($scope.maintenance['UpdateClient'] == 1) {
				$scope.showUpdateClientMaintenance = true;				
			}
		} 		
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getPurchaseDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PurchaseAndSale', 
	    method: "GET",
	    params:  {index: propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.purchaseAndSale = resp.data[0];
			
			$scope.purchaseAndSale['ClosignDate'] = dateFormat($scope.purchaseAndSale['ClosignDate']);
			$scope.purchaseAndSale['Closed'] = dateFormat($scope.purchaseAndSale['Closed']);
			
			$scope.isHasPurchaseFile = $scope.purchaseAndSale['IsHasFile'] == 1 ? true : false;
			$scope.IsBuyerFile = $scope.purchaseAndSale['IsBuyerFile'] == 1 ? true : false;
			$scope.IsSignedDocsFile = $scope.purchaseAndSale['IsSignedDocsFile'] == 1 ? true : false;
			$scope.IsBalanceFile = $scope.purchaseAndSale['IsBalanceFile'] == 1 ? true : false;
			$scope.IsFilesTo = $scope.purchaseAndSale['IsFilesToS‌ignFile'] == 1 ? true : false;
			$scope.showPurchaseNote = $scope.purchaseAndSale['ShowNote'] == 1 ? true : false;
			
			if($scope.purchaseAndSale['UpdateClient'] == 1) {
				$scope.showUpdateClientPurchase = true;				
			}
		} 		
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getClosingDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Closing', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.closing = resp.data[0];
			
			console.log("response closing obj", resp.data[0]);
			
			$scope.IsClosingHasFile = $scope.closing['IsHasFile'] == 1 ? true : false;
			$scope.IsWalkThroghFile = $scope.closing['IsWalkThroghFile'] == 1 ? true : false;
			$scope.IsInsuranceFile = $scope.closing['IsInsuranceFile'] == 1 ? true : false;
			$scope.IsClosingDocsFile = $scope.closing['IsClosingDocsFile'] == 1 ? true : false;
			$scope.showClosingNote = $scope.closing['ShowNote'] == 1 ? true : false;
			
			if($scope.closing['UpdateClient'] == 1) {
				$scope.showUpdateClientClosing = true;				
			}
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getRenovationDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Renovation', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.renovation = resp.data[0];
		
			$scope.renovation['StartDate'] = dateFormat($scope.renovation['StartDate']);
			$scope.renovation['FinishDate'] = dateFormat($scope.renovation['FinishDate']);
			$scope.renovation['CofODate'] = dateFormat($scope.renovation['CofODate']);
			
			$scope.IsHasRenovationFile = $scope.renovation['IsHasFile'] == 1 ? true : false;
			$scope.IsFundsSentFile = $scope.renovation['IsFundsSentFile'] == 1 ? true : false;
			$scope.IsWorkEstimateFile = $scope.renovation['IsWorkEstimateFile'] == 1 ? true : false;
			$scope.IsPayment1File = $scope.renovation['IsPayment1File'] == 1 ? true : false;
			$scope.IsPayment2File = $scope.renovation['IsPayment2File'] == 1 ? true : false;
			$scope.IsPayment3File = $scope.renovation['IsPayment3File'] == 1 ? true : false;
			$scope.IsCOFOFile = $scope.renovation['IsCOFOFile'] == 1 ? true : false;
			$scope.showRenovationNote = $scope.renovation['ShowNote'] == 1 ? true : false;
			
			if($scope.renovation['UpdateClient'] == 1) {
				$scope.showUpdateClientRenovation = true;				
			}
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getLeasingDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Leasing', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
		
			$scope.leasing = resp.data[0];
		
			$scope.leasing['StartDate'] = dateFormat($scope.leasing['StartDate']);
			$scope.leasing['EstimateRentDate'] = dateFormat($scope.leasing['EstimateRentDate']);
			$scope.leasing['MoveInDate'] = dateFormat($scope.leasing['MoveInDate']);
			
			$scope.IsHasLeasingFile = $scope.leasing['IsHasFile'] == 1 ? true : false;
			$scope.IsApplicationFile = $scope.leasing['IsApplicationFile'] == 1 ? true : false;
			$scope.IsLeaseFile = $scope.leasing['IsLeaseFile'] == 1 ? true : false;
			$scope.showLeasingNote = $scope.leasing['ShowNote'] == 1 ? true : false;
			
			if($scope.leasing['UpdateClient'] == 1) {
				$scope.showUpdateClientLeasing = true;				
			}
		}		
	}, function(err) {
	    console.error('ERR', err);
	})	
}

function getOccupiedDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Occupied', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
		
			$scope.occupied = resp.data[0];
			$scope.occupied['EvictionDate'] = dateFormat($scope.occupied['EvictionDate']);
			$scope.occupied['GoingToBeVacent'] = dateFormat($scope.occupied['GoingToBeVacent']);
			
			$scope.IsHasOccupiedFile = $scope.occupied['IsHasFile'] == 1 ? true : false;
			$scope.IsMaintanenceFile = $scope.occupied['IsMaintanenceFile'] == 1 ? true : false;
			$scope.showOccupiedNote = $scope.occupied['ShowNote'] == 1 ? true : false;
			
			if($scope.occupied['UpdateClient'] == 1) {
				$scope.showUpdateClientOccupied = true;				
			}
		}
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getEvictionDetails(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Eviction', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$scope.showEvictionSection = true;
			
			$scope.eviction = resp.data[0];

			$scope.eviction['CourtDate'] = dateFormat($scope.eviction['CourtDate']);
			$scope.eviction['RemovedDate'] = dateFormat($scope.eviction['RemovedDate']);
			
			$scope.IsHasEvictionFile = $scope.eviction['IsHasFile'] == 1 ? true : false;
			$scope.showEvictionNote = $scope.eviction['ShowNote'] == 1 ? true : false;
			
			if($scope.eviction['UpdateClient'] == 1) {
				$scope.showUpdateClientEviction = true;				
			}
		} else {
			$scope.showEvictionSection = false;
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function addClass(data) {
	var length = data.length;
	var rndvalKodem;
	var rndval;
	
	//----------------------
	//add col- class
	if(data.length % 2 != 0) {
		data[data.length - 1].class = "col-100";
		length -= 1;
	}
	
	rndvalKodem = 0;
	for(var i = 0; i < length; i+=2) {
		do {
			rndval = widthArr[Math.floor(Math.random()*widthArr.length)];
		} while (rndval == rndvalKodem);
		rndvalKodem = rndval;				
		data[i].class = "col-" + rndval;
		rndval = 100 - rndval;
		data[i+1].class = "col-" + rndval;
	}
	
	//----------------------
	//add desaturate class
	for(var i = 0; i < data.length; i++) {
		if(data[i]["IsSoled"] == 1) {
			data[i].class += " desaturate";
		}
	}
}

// Add comma to each property price
function addCommaToPrice(data) {
	for(var i = 0; i < data.length; i++) {			
		data[i]["BuyPrice"] = numberWithCommas(data[i]["BuyPrice"]);
	}
}

//set short name to property, just the street
function setShortName(data) {
	if(data) {
		for(var i = 0; i < data.length; i++) {			
			data[i]["PropertyName"] = SplitName(data[i]["PropertyName"]);
		}
	}
}

function getRochesterProperties($scope, $http) {
	// get properties to Rochester branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:1}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.rochesterProperties = [];
		$scope.rochesterProperties = resp.data;
		
		if(resp.data.length == 0) {
			$scope.showRochester = 0;
		}
		
		addClass($scope.rochesterProperties);
		addCommaToPrice($scope.rochesterProperties);
		setShortName($scope.rochesterProperties);
		
	}, function(err) {
	    console.error('ERR', err);
	});
}

function getClevelandProperties($scope, $http) {
	// get properties to cleveland branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:2}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.clevelandProperties = [];
		$scope.clevelandProperties = resp.data;
		if(resp.data.length == 0) {
			$scope.showCleveland = 0;
		}
		
		addClass($scope.clevelandProperties);
		addCommaToPrice($scope.clevelandProperties);
		setShortName($scope.clevelandProperties);
	
	}, function(err) {
	    console.error('ERR', err);
	});
} 

function getColumbusProperties($scope, $http) {
	// get properties to columbus branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:3}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.columbusProperties = [];
		$scope.columbusProperties = resp.data;
		
		if(resp.data.length == 0) {
			$scope.showColumbus = 0;
		}
		
		addClass($scope.columbusProperties);
		addCommaToPrice($scope.columbusProperties);
		setShortName($scope.columbusProperties);
	
	}, function(err) {
	    console.error('ERR', err);
	});
}

function getJacksonvilleProperties($scope, $http) {
	// get properties to jacksonville branch
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getPropertiesPerBranchId', 
	    method: "GET",
	    params:  {index:4}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.jacksonvilleProperties = [];
		$scope.jacksonvilleProperties = resp.data;
		if(resp.data.length == 0) {
			$scope.showJacksonviller = 0;
		}
		addClass($scope.jacksonvilleProperties);
		addCommaToPrice($scope.jacksonvilleProperties);
		setShortName($scope.jacksonvilleProperties);
		
	}, function(err) {
	    console.error('ERR', err);
	}); 
}

function getProperties($scope, $http, $q) {	 
	return $q.all([getRochesterProperties($scope, $http), getClevelandProperties($scope, $http), 
	                getColumbusProperties($scope, $http), getJacksonvilleProperties($scope, $http)]).
	                then(function(results) {
		$scope.isRouteLoading = false;
	});
}

function getAllMarketingPropertyImages(propertyId, $scope, $rootScope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getAllMarketingPropertyImages', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$rootScope.marketingPropertyImages = resp.data;
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getMarketingPropertyInfo(propertyId, $scope, $http) {
	var investmentAmount, salePrice, purchaseCost, closingCost, softCost, investmentME, financing, address;
	
	
	
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getMarketingId', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$scope.marketingData = resp.data[0];
			
			investmentAmount = $scope.marketingData["BuyPrice"];
			salePrice = $scope.marketingData["SalePrice"];
			purchaseCost = $scope.marketingData["PurchaseCost"];
			closingCost = $scope.marketingData["ClosingCost"];
			softCost= $scope.marketingData["SoftCost"];
			investmentME = $scope.marketingData["InvestmentME"];
			financing = $scope.marketingData["Financing"];
			address = $scope.marketingData["Address"];
			rating = $scope.marketingData["Rating"];
			numOfUnits = $scope.marketingData["NumOfUnits"];
			$scope.marketingData["MinInvestment"] = numberWithCommas($scope.marketingData["MinInvestment"]);	
			$scope.marketingData["BuyPrice"] = numberWithCommas($scope.marketingData["BuyPrice"]);	
			$scope.marketingData["Sqft"] = numberWithCommas($scope.marketingData["Sqft"]);
			
			//console.log('marketing data', $scope.marketingData);

			capitalStructure($scope, investmentAmount, purchaseCost, closingCost, softCost, investmentME, financing);
			drawInvestmentCostsCart(investmentAmount, purchaseCost, closingCost, softCost, investmentME, financing);
			drawSensitivityAnalysisCart(investmentAmount, salePrice, numOfUnits);
			drawRating(rating);
			darwGoogleMap(address);
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getMarketSummaryImage(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getMarketSummaryImage', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$scope.summaryImage = resp.data[0];
			
			$scope.summaryFileName = resp.data[0]["FileName"];
			
			//console.log("summaryImage", $scope.summaryImage);
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getEntrepreneurImage(propertyId, $scope, $http) {
	return $http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getEntrepreneurImage', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$scope.entrepreneurImage = resp.data[0];
			
			$scope.entrepreneurFileName = resp.data[0]["FileName"];
			
			//console.log("entrepreneurImage", $scope.entrepreneurImage);
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function drawInvestmentCostsCart(buySum, purchaseCost, closingCost, softCost, investmentME, financing ) {
	
	var svg = d3.select("div#investmentAmountCart").append("svg").attr("width", 150).attr("height", 160);

	svg.append("g").attr("id", "salesDonut");

	var val1 = purchaseCost/buySum;
	var val2 = closingCost/buySum;
	var val3 = softCost/buySum;
	var val4 = investmentME/buySum;
	var val5 = financing/buySum;
	
	Donut3D.draw("salesDonut", 
			[ {label:"sss", value:val1, color:"#499FCE"}, 
			  {label:"sss", value:val2, color:"#1B4A64"}, 
			  {label:"sss", value:val3, color:"#A37E64"}, 
			  {label:"sss", value:val4, color:"#662756"}, 
			  {label:"aaa", value:val5, color:"#7F8354"}
			], 70, 90, 70, 70, 0, 0.6);
}

function drawSensitivityAnalysisCart(buySum, saleSum, numOfUnits) {
	var income = saleSum - buySum;
	
	var data = {
		    labels: ["  -20%", "  -15%", "  -10%", "  -5%",  "   Base ", " 5%", " 10%", " 15%", " 20%"],
		    datasets: [		        
		        {
		            label: "Market Changes",
		            fillColor: "rgba(73,159,206,0.75)",
		            //strokeColor: "rgba(163,126,100,0.8)",
		            highlightFill: "rgba(73,159,206,0)",
		            highlightStroke: "rgba(73,159,206,0)",
		            data: [calcPercent(saleSum, 20, "minus", buySum), calcPercent(saleSum, 15, "minus", buySum), calcPercent(saleSum, 10, "minus", buySum), calcPercent(saleSum, 5, "minus", buySum), 
		                   income, 
		                   calcPercent(saleSum, 5, "plus", buySum), calcPercent(saleSum, 10, "plus", buySum), calcPercent(saleSum, 15, "plus", buySum) , calcPercent(saleSum, 20, "plus", buySum)]
		        }
		    ]
		};

		// Get the context of the canvas element we want to select
		var ctx = document.getElementById("myChart").getContext("2d");
		var option = { scaleShowGridLines : false, 
				       scaleOverride : true,
		        	   scaleSteps : 10,
		               scaleStepWidth : calcStepWidth(numOfUnits),
		               scaleStartValue : 0,
		               showTooltips: false,
		               onAnimationComplete: function () {

		                   var ctx = this.chart.ctx;
		                   ctx.font = this.scale.font;
		                   ctx.fillStyle = "black";
		                   ctx.textAlign = "left";
		                   ctx.textBaseline = "bottom";

		                   this.datasets.forEach(function (dataset) {
		                       dataset.bars.forEach(function (bar) {
		                    	   ctx.fillText(numberWithCommas(Math.round( bar.value )) + "", bar.x/2, bar.y+7);
		                       });
		                   })
		               }
		             }	
		//var myBarChart = new Chart(ctx).HorizontalBar(data,  option);
		window.myObjBar = new Chart(ctx).HorizontalBar(data, option);

	    //new colors
	    myObjBar.datasets[0].bars[0].fillColor = "rgba(255, 153, 0, 1)"; //bar 1
	    myObjBar.datasets[0].bars[0].strokeColor = "rgba(255, 153, 0, 1)"; //bar 1
	    
	    myObjBar.datasets[0].bars[1].fillColor = "rgba(255, 153, 0, 0.75)"; //bar 2
	    myObjBar.datasets[0].bars[1].strokeColor = "rgba(255, 153, 0, 0)"; //bar 2
	    
	    myObjBar.datasets[0].bars[2].fillColor = "rgba(255, 153, 0, 0.5)"; //bar 3
	    myObjBar.datasets[0].bars[2].strokeColor = "rgba(255, 153, 0, 0)"; //bar 3	    
	    
	    myObjBar.datasets[0].bars[3].strokeColor = "rgba(255, 153, 0, 0)"; //bar 4
	    myObjBar.datasets[0].bars[3].fillColor = "rgba(255, 153, 0, 0.25)"; //bar 4
	    
	    myObjBar.datasets[0].bars[4].strokeColor = "rgba(220,220,220,0)"; //bar 5
	    myObjBar.datasets[0].bars[4].fillColor = "rgba(220,220,220,0.5)"; //bar 5
	    
	    myObjBar.datasets[0].bars[5].fillColor = "rgba(102, 153, 0, 0.25)"; //bar 6
	    myObjBar.datasets[0].bars[5].strokeColor = "rgba(102, 153, 0, 0)"; //bar 6
	    
	    myObjBar.datasets[0].bars[6].fillColor = "rgba(102, 153, 0, 0.5)"; //bar 7
	    myObjBar.datasets[0].bars[6].strokeColor = "rgba(102, 153, 0, 0)"; //bar 7
	    
	    myObjBar.datasets[0].bars[7].fillColor = "rgba(102, 153, 0, 0.75)"; //bar 8
	    myObjBar.datasets[0].bars[7].strokeColor = "rgba(102, 153, 0, 0)"; //bar 8
	    
	    myObjBar.datasets[0].bars[8].fillColor = "rgba(102, 153, 0, 1)"; //bar 9
	    myObjBar.datasets[0].bars[8].strokeColor = "rgba(102, 153, 0, 0)"; //bar 9
	    
	    myObjBar.update();
}

function drawRating(rating) {
	var imageUrl = '';
	switch (rating) {
	    case "A":  $('.ratingImg').html('<img src="css/img/A.png" height="auto" width="100%">');
	               break;
	    case "B":  $('.ratingImg').html('<img src="css/img/B.png" height="auto" width="100%">');
        		   break;
	    case "C":  $('.ratingImg').html('<img src="css/img/C.png" height="auto" width="100%">');
        		   break;
	    case "D":  $('.ratingImg').html('<img src="css/img/D.png" height="auto" width="100%">');
        		   break;
	    case "E":  $('.ratingImg').html('<img src="css/img/E.png" height="auto" width="100%">');
        		   break;
	    case "F":  $('.ratingImg').html('<img src="css/img/F.png" height="auto" width="100%">');
        		   break;
	}
}

function capitalStructure($scope, investmentAmount, purchaseCost, closingCost, softCost, investmentME, financing) {
	if(investmentAmount != "0") {
		$scope.purchaseCostTotalPercent = Math.round(purchaseCost / investmentAmount * 100);
		$scope.closingCostTotalPercent = Math.round(closingCost / investmentAmount * 100);
		$scope.softCostTotalPercent = Math.round(softCost / investmentAmount * 100);
		$scope.investmentMETotalPercent = Math.round(investmentME / investmentAmount * 100);
		$scope.financingTotalPercent = Math.round(financing / investmentAmount * 100);
		$scope.totalPercent = Math.round($scope.purchaseCostTotalPercent + $scope.closingCostTotalPercent + $scope.softCostTotalPercent + $scope.investmentMETotalPercent + $scope.financingTotalPercent);
		
		$scope.purchaseCostAmount =  $scope.purchaseCostTotalPercent * investmentAmount / 100;
		$scope.closingCostAmount = $scope.closingCostTotalPercent * investmentAmount / 100;
		$scope.softCostAmount = $scope.softCostTotalPercent * investmentAmount / 100;
		$scope.investmentMEAmount = $scope.investmentMETotalPercent * investmentAmount / 100;
		$scope.financingAmount = $scope.financingTotalPercent * investmentAmount / 100;
		$scope.totalAmount = $scope.purchaseCostAmount + $scope.closingCostAmount + $scope.softCostAmount + $scope.investmentMEAmount + $scope.financingAmount;
		//add commas
		$scope.purchaseCostAmount = numberWithCommas($scope.purchaseCostAmount);
		$scope.closingCostAmount = numberWithCommas($scope.closingCostAmount);
		$scope.softCostAmount = numberWithCommas($scope.softCostAmount);
		$scope.investmentMEAmount = numberWithCommas($scope.investmentMEAmount);
		$scope.financingAmount = numberWithCommas($scope.financingAmount);
		$scope.totalAmount = numberWithCommas($scope.totalAmount);
	}
}

function darwGoogleMap(address) {
	var geocoder;
	var map;
	var address = address ;
    
	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(-34.397, 150.644);
        
    var mapOptions = {
		zoom: 8,
	    center: latlng,
	    mapTypeControl: true,
	    mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
	    navigationControl: true,
	    mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        
    if (geocoder) {
        geocoder.geocode( { 'address': address}, function(results, status) {
	        if (status == google.maps.GeocoderStatus.OK) {
		        if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {		        	
		        	map.setCenter(results[0].geometry.location);		
		        	
		        	var infowindow = new google.maps.InfoWindow(
		              { content: '<b>'+address+'</b>',
		                size: new google.maps.Size(150,50)
		              });
		
		        	var marker = new google.maps.Marker(
		        	  { position: results[0].geometry.location,
		        		map: map, 
		                title:address
		              }); 
		          
		        	google.maps.event.addListener(marker, 'click', function() {
		        		infowindow.open(map,marker);
		        	});
		
		        } else {
		          alert("No results found");
		        }
	        } else {
	          alert("Geocode was not successful for the following reason: " + status);
	        }
	    });
    }
}

//get main bar values
function getMainBarValues($scope, $http) {	
    url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Property/getPropertiesROIChartAPI';
	id = localStorage.getItem('id');
	$http({
	    url: url, 
	    method: "GET",
	    params:  {index:id}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.propertyBar = [];

		$scope.propertyBar = resp.data[0];
		
		var investmentAmount = resp.data[0]['InvestmentAmount'];
		
		var val = (investmentAmount != 0 ) ? resp.data[0]['TotalReturn'] / resp.data[0]['InvestmentAmount'] * 100 : 0;
		//var val = (investmentAmount != 0 ) ? totalReturn / investmentAmount * 100 : 0;
		
		$scope.propertyBar.InvestmentAmount = numberWithCommas(investmentAmount);
		var num = parseFloat(resp.data[0]['TotalReturn']).toFixed(2);
		$scope.propertyBar.TotalReturn = numberWithCommas(num);
		
		// bar
		var div1 = d3.select(document.getElementById('div1'));
		start();

		function onClick1() {
		    deselect();
		}

		function labelFunction(val,min,max) {

		}

		function deselect() {
		    //div1.attr("class","radial");
		}

		function start() {
			$('.label').val("sghdsfhsdf");
		    var rp1 = radialProgress(document.getElementById('div1'))
		            .label("ROI")
		            .onClick(onClick1)
		            .value(val)
		            .render();
		}
	
	}, function(err) {
	    console.error('ERR', err);
	})
}

//get properties for 'your properties' section
function getPropertiesForYourPropertiesSection($scope, $rootScope, $http) {	
	if(localStorage.getItem("loginUserType") == "client") {    	
    	url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PropertyImage';
    	id = localStorage.getItem('id');
    	return $http({
    	    url: url, 
    	    method: "GET",
    	    params:  {index:id}, 
    	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    	}).then(function(resp) {

    		$scope.propertyImage = [];
    		$scope.propertyImage = resp.data;
    		
    		$rootScope.propertyCnt = resp.data.length;
    		
    		// set default image to property in case that no image attached.
    		for(var i = 0; i < $scope.propertyImage.length; i++) {
    			if($scope.propertyImage[i].FileName == null) {
    				$scope.propertyImage[i].FileName = "defaultProperty.jpg";
    			}
    		}
    		
    		addClass($scope.propertyImage);
    		setShortName($scope.propertyImage);
    		
    	}, function(err) {
    	    console.error('ERR', err);
    	})
    }
}

//get properties for 'special deals section'
function getPropertiesForSpecialDealsSection($scope, $http) {
	if(localStorage.getItem("loginUserType") == "client") {    	
		url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PropertyImage/getSpecialDealsPropertyImage';
		id = localStorage.getItem('id');
		return $http({
		    url: url, 
		    method: "GET",
		    params:  {index:id}, 
		    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		}).then(function(resp) {
	
			$scope.showScopeSection = true;
			$scope.specialPropertyImage = [];
			$scope.specialPropertyImage = resp.data;
	
			if(resp.data.length == 0) {
				$scope.showScopeSection = false;
			}
			
			//console.log("$scope.specialPropertyImage", $scope.specialPropertyImage);
			
			addClass($scope.specialPropertyImage);
			setShortName($scope.specialPropertyImage);
			addCommaToPrice($scope.specialPropertyImage);
			
		}, function(err) {
		    console.error('ERR', err);
		})
	}
}

function getMarketingDetailsPageData(propertyId, $scope, $rootScope, $http, $q) {
	return $q.all([getAllMarketingPropertyImages(propertyId, $scope, $rootScope, $http),
	               getMarketingPropertyInfo(propertyId, $scope, $http),
	               getMarketSummaryImage(propertyId, $scope, $http),
	               getEntrepreneurImage(propertyId, $scope, $http)]).
	                then(function(results) {
		$scope.isMarketingDetailsLoading = false;
	});
}

function getOverviewPageData($scope, $rootScope, $http, $q) {	 
	return $q.all([getPropertiesForYourPropertiesSection($scope, $rootScope, $http), 
	               getPropertiesForSpecialDealsSection($scope, $http)]).
	                then(function(results) {
		$scope.isOverviewLoading = false;
	});
}

function getOverviewDetailsPageData(propertyId, $scope, $http, $q) {
	return $q.all([getPropertyImage(propertyId, $scope, $http),
	               getPropertyChart(propertyId, $scope, $http),
	               getMaintenanceDetails(propertyId, $scope, $http),
	               getPurchaseDetails(propertyId, $scope, $http), 
	               getClosingDetails(propertyId, $scope, $http),
	               getRenovationDetails(propertyId, $scope, $http), 
	               getLeasingDetails(propertyId, $scope, $http),
	               getOccupiedDetails(propertyId, $scope, $http),
	               getEvictionDetails(propertyId, $scope, $http)]).
	                then(function(results) {
		$scope.isPropertyDetailsLoading = false;
	});
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function SplitName(str) {
	var array = str.split(',');
	return array[0];
}

function dateFormat(date) {
	var formattedDate = new Date(date);
	return (formattedDate.getMonth() + 1) + '/' + formattedDate.getDate() + '/' +  formattedDate.getFullYear();
}

function calcPercent(sum, percent, operator, buySum) {
	var val;
	if(operator == 'minus') {
		return val = sum * ((100 - percent) / 100) - buySum;
	} else {
		return val = sum * ((100 + percent) / 100) - buySum;
	}
}

// see different x axis values according the number of units
function calcStepWidth(units) {
	if(units < 3)
		return 2000;
	else if(units < 8)
		return 6000;
		else
			return 2000000;
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function updateClientRead($http, propertyId, section) {
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/' + section + '/updateClientRead', 
	    method: "GET",
	    params:  {index: propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
			
	}, function(err) {
	    console.error('ERR', err);
	});
}

function check_new_chatc($firebaseObject ,$firebaseArray, branchName, thisUserId) {
	var ref = new Firebase("https://updatemeapp.firebaseio.com/messages/" + branchName + "/" + thisUserId);
	chats = $firebaseArray(ref);

	return chats;
}

function get_new_not($http) {
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/getClientNotification', 
	    method: "GET",
	    params:  { index: localStorage.getItem("id")}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
		
		text = resp.data[0]['Text'];
		NotificationId = resp.data[0]['Id'];
		
		   var alertPopup = $ionicPopup.alert({
			     title: 'New message from ME',
			     template: text
			   });
	
				$http({
				    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing/setClientNotificationStatus', 
				    method: "POST",
				    data: { NotificationId: NotificationId},
				    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				}).then(function(resp) {
					console.log("sucess")
				}, function(err) {
				    console.error('ERR', err);
				})	
	
		   
		}
		
	}, function(err) {
	    
	});
}
