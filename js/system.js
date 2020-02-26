var api = null;

function init() {
	__log("Initialization...");
	__checkAuthentication().then(function() {
		
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
				})
			}
		} catch {
			// NOP
		}
		reject(false);
	});
}