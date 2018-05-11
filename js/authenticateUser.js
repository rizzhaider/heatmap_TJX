
function onUserSubmit(){
	const _username = document.getElementById("username").value;
	const _password = document.getElementById("password").value;
    if(_username !== "" && _password !== ""){
    	userAuthentication(_username, _password);
    }		
  }//onUserSubmit

$(document).keypress(function (event) {
	if (event.keyCode == 13){
		onUserSubmit();
	}	
});//onEnter


function userAuthentication(username, password){
			const _username = username;
			const _password = password;
			  let authObjectData = JSON.stringify({
					 "userName": _username,
					 "password":_password,
					 "state":"login"
				   });
			  spinnerLock(true);
			  const url = urlTjxAuthentication;
			  fetch(url,
					    {
						  method: "POST",
						  headers: new Headers({
							     'Authorization': 'Basic '+btoa('hughes:hughes'), 
							     'content-type': 'application/json'
							   }),						 
						  body: authObjectData
					  }).then((resp) => resp.json())
					   .then(function(data){
						   if(data === "Authenticated"){
							   spinnerLock(false);
							  sessionStorage.setItem('heatmap_tjx_isLoggedIn', 'true');				
							  window.location = "tjx.html"; // Redirecting to home page.
							//return false;
						   }else {
							alert("Invalid Credentials");
							spinnerLock(false);
						   }
					  })
					  .catch(error => {console.error('Error:', error); //spinnerLock(false) 
					  });
		}//userAuthentication

function spinnerLock(toBeLocked) {
    if(toBeLocked == true) {
        $('#spinner').show();       
    } else {
        $('#spinner').hide();
    }
}// spinnerLock

$(document).ready(function (){	
	var url_string = location.href;
	if(url_string.indexOf('?' + "username") != -1 || url_string.indexOf('&' + "username") != -1){
		var checkUrl = new URL(url_string);
		const _username = checkUrl.searchParams.get("username");
		const _password = checkUrl.searchParams.get("password");
		userAuthentication(_username, _password);
	}

	if(sessionStorage.getItem('heatmap_tjx_isLoggedIn')){
		window.location = "tjx.html";
	} 
});
