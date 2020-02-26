function doLogin() {
	let address = $("#address").val();
	let login = $("#login").val();
	let passw = $("#password").val();
	
	if (address && login && passw) {
		let api = new MPlayerAPI(address);
		api.login(login, passw).then(function(data) {
			if (data.token) {
				localStorage.setItem("address", address);
				localStorage.setItem("username", login);
				localStorage.setItem("userpassw", passw);
				document.location = "index.html";
			}
		}).catch(function(data) {
			if (data.responseJSON) {
				$("#login-info").html("<div class='alert alert-danger' role='alert'><strong>Login error</strong><br>" + data.responseJSON.message + "!</div>");
			} else {
				$("#login-info").html("<div class='alert alert-danger' role='alert'><strong>Login error</strong><br>Server error!</div>");
			}
		});
	}
}