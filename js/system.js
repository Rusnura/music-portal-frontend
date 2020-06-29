var api = null;

function init() {
	__log("Initialization...");
	__checkAuthentication().then(function() {
		__log("User is autorized!");
		__init();
	}).catch(function() {
		document.location = "login.html";
	});
}

function __init() {
	__loadPlaylists().then(function(userPlaylistsJson) {
		__log("Playlists loaded: ", userPlaylistsJson);
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

function __loadPlaylists(userName) {
	return new Promise(function(resolve, reject) {
		if (userName) {
			api.getUserPlaylists(userName).then(function(userPlaylistsJson) {
				resolve(userPlaylistsJson);
			}).catch(function(cause) {
				reject(cause);
			});
		} else {
			api.getMyPlaylists().then(function(userPlaylistsJson) {
				resolve(userPlaylistsJson);
			}).catch(function(cause) {
				reject(cause);
			});
		}
	});
}