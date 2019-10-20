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
		let credentials = {
			username: login,
			password: password
		};

		this.webRequest.send(this.address + "api/authenticate", "POST", JSON.stringify(credentials), this.headers).then(function(data) {
			this.token = data.token; // !!! CAN'T UPDATE TOKEN, error with "this" context
		});
	}
	
	
}