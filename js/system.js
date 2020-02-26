var api = null;

function init() {
	__log("Initialization...");
	__checkAuthentication().then(function() {
		__log("User is autorized!");
	}).catch(function() {
		document.location = "login.html";
	});
}

function __checkAuthentication() {
	return new Promise(function(resolve, reject) {
		let address = localStorage.getItem("address");
		let username = localStorage.getItem("username");
		let userpass = localStorage.getItem("userpassw");
		
		try {
			if (address && username && userpass) {
				api = new MPlayerAPI(address);
				api.login(username, userpass).then(function(data) {
					if (data.token) {
						resolve(true);
					}
				}).catch(function() {
					reject(false);
				});
			}
		} catch {
			reject(false);
		}
	});
}