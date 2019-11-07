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
				headers: headers,
				cache : false, 
				contentType: false, // Need for multipart/form-data request
				processData: false // Need for multipart/form-data request
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
	
	getMyAlbums() {
		return this.webRequest.send(this.address + "api/albums", "GET", null, {...this.headers, "Authorization": "Bearer " + this.token});
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
	
	createSong(mp3File, albumId, artist, title) {
		let songData = {
			artist: artist,
			title: title
		};
		
		let formData = new FormData();
		formData.append("audio", mp3File);
		formData.append("body", new Blob([JSON.stringify(songData)], {type: "application/json"}));
		return this.webRequest.send(this.address + "api/album/" + albumId + "/song", "POST", formData, {...this.headers, "Content-Type": undefined, "Authorization": "Bearer " + this.token});
	}
	
	getMySongs() {
		return this.webRequest.send(this.address + "api/songs", "GET", null, {...this.headers, "Authorization": "Bearer " + this.token});
	}
	
	getSong(albumId, songId) {
		return this.webRequest.send(this.address + "api/album/" + albumId + "/song/" + songId, "GET", null, {...this.headers, "Authorization": "Bearer " + this.token});
	}
	
	getSongMP3File(albumId, songId) {
		return this.webRequest.send(this.address + "api/album/" + albumId + "/song/" + songId + "/mp3", "GET", null, {...this.headers, "Authorization": "Bearer " + this.token});
	}
	
	getAlbumSongs(albumId) {
		return this.webRequest.send(this.address + "api/album/" + albumId + "/songs", "GET", null, {...this.headers, "Authorization": "Bearer " + this.token});
	}
	
	editSong(albumId, songId, artist, title) {
		let songData = {
			artist: artist,
			title: title
		};

		return this.webRequest.send(this.address + "api/album/" + albumId + "/song/" + songId, "PUT", JSON.stringify(songData), {...this.headers, "Authorization": "Bearer " + this.token});
	}
	
	deleteSong(albumId, songId) {
		return this.webRequest.send(this.address + "api/album/" + albumId + "/song/" + songId, "DELETE", null, {...this.headers, "Authorization": "Bearer " + this.token});
	}
}