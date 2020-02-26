function doLogin() {
	let address = $("#address").val();
	let login = $("#login").val();
	let passw = $("#password").val();
	
	if (address && login && passw) {
		let api = new MPlayerAPI(address);
		api.login(login, passw).then(function(data) {
			console.log("success data", data);
			if (data.status == 200) {
				document.location.reload();
			}
		}).catch(function(data) {
			$("#login-info").html("<div class='alert alert-danger' role='alert'><strong>Login error</strong><br>" + data.responseJSON.message + "!</div>");
		});
	}
}