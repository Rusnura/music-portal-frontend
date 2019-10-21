class WebRequest {
	constructor() { }
	
	send(url, method, body, headers) {
		return new Promise(function(resolve, reject) {
			let data = {
				method: method,
				headers: headers
			};
			
			if (method !== "GET") {
				data["body"] = body;
			}
			
			$.ajax({
				async: true,
				type: method,
				url: url,
				data: body,
				headers: headers
			}).done(function(data) {
				resolve(data);
			}).fail(function(reason) {
				reject(reason);
			});
		});
	}
}

class MPlayerAPI {
	constructor(APIAddress) {
		this.address = APIAddress;
		this.token = null;
		this.headers = {
			"Content-Type": "application/json"
		}
		this.webRequest = new WebRequest();
		if (this.address[this.address.length - 1] !== '/') { // Normalize address
			this.address = this.address + "/";
		}
	}
	
	register(login, password, name, lastname) {
		let userdata = {
			username: login,
			password: password,
			name: name,
			lastname: lastname
		};
		return this.webRequest.send(this.address + "api/register", "POST", JSON.stringify(userdata), this.headers);
	}
	
	login(login, password) {
		let _self = this;
		return new Promise(function(resolve, reject) {
			let credentials = {
				username: login,
				password: password
			};
			
			_self.webRequest.send(_self.address + "api/authenticate", "POST", JSON.stringify(credentials), _self.headers).then(function(data) {
				_self.token = data.token;
				resolve(data);
			}).catch(function(data) {
				reject(data);
			});
		});
	}
	
	createAlbum(name, description, internal) {
		let albumData = {
			name: name,
			description: description,
			internal: internal || false
		};
		
		return this.webRequest.send(this.address + "api/album", "POST", JSON.stringify(albumData), {...this.headers, "Authorization": "Bearer " + this.token});
	}
	
	getAlbum(albumId) {
		return this.webRequest.send(this.address + "api/album/" + albumId, "GET", null, {...this.headers, "Authorization": "Bearer " + this.token});
	}
	
	getUserAlbums(username) {
		return this.webRequest.send(this.address + "api/user/" + username + "/albums", "GET", null, {...this.headers, "Authorization": "Bearer " + this.token});
	}
	
	editAlbum(albumId, name, description, internal) {
		let albumData = {
			name: name,
			description: description,
			internal: internal || false
		};
		
		return this.webRequest.send(this.address + "api/album/" + albumId, "PUT", JSON.stringify(albumData), {...this.headers, "Authorization": "Bearer " + this.token});
	}
	
	deleteAlbum(albumId) {
		return this.webRequest.send(this.address + "api/album/" + albumId, "DELETE", null, {...this.headers, "Authorization": "Bearer " + this.token});
	}
}