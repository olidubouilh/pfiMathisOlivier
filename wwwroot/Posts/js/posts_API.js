class Posts_API {
    static serverHost() {
        //return "https://linuxapiserver.azurewebsites.net";
        return "http://localhost:5000";
    }
    
    static POSTS_API_URL() { 
        return this.serverHost() + "/api/posts"; 
    }
    
    static ACCOUNTS_API_URL() { 
        return this.serverHost() + "/api/accounts"; 
    }
    
    static initHttpState() {
        this.currentHttpError = "";
        this.currentStatus = 0;
        this.error = false;
    }
    
    static setHttpErrorState(xhr) {
        if (xhr.responseJSON)
            this.currentHttpError = xhr.responseJSON.error_description;
        else
            this.currentHttpError = xhr.statusText == 'error' ? "Service introuvable" : xhr.statusText;
        this.currentStatus = xhr.status;
        this.error = true;
    }
    
    static async HEAD() {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.POSTS_API_URL(),
                type: 'HEAD',
                contentType: 'text/plain',
                complete: data => { resolve(data.getResponseHeader('ETag')); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async Get(id = null) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.POSTS_API_URL() + (id != null ? "/" + id : ""),
                complete: data => { resolve({ ETag: data.getResponseHeader('ETag'), data: data.responseJSON }); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async GetQuery(queryString = "") {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.POSTS_API_URL() + queryString,
                complete: data => {
                    resolve({ ETag: data.getResponseHeader('ETag'), data: data.responseJSON });
                },
                error: (xhr) => {
                    Posts_API.setHttpErrorState(xhr); resolve(null);
                }
            });
        });
    }
    
    static async Save(data, create = true) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: create ? this.POSTS_API_URL() : this.POSTS_API_URL() + "/" + data.Id,
                type: create ? "POST" : "PUT",
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: (data) => { resolve(data); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async Delete(id) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.POSTS_API_URL() + "/" + id,
                type: "DELETE",
                success: () => { resolve(true); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async login(email, password) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.ACCOUNTS_API_URL() + "/login",
                type: "POST",
                contentType: 'application/json',
                data: JSON.stringify({ Email: email, Password: password }),
                success: (data) => { resolve({ data: data }); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async logout(userId) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.ACCOUNTS_API_URL() + "/logout/" + userId,
                type: "POST",
                contentType: 'application/json',
                success: () => { 
                    sessionStorage.removeItem("bearerToken");
                    sessionStorage.removeItem("user");
                    resolve(true); 
                },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async register(userData) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.ACCOUNTS_API_URL() + "/register",
                type: "POST",
                contentType: 'application/json',
                data: JSON.stringify(userData),
                success: (data) => { resolve(data); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async verify(userId, code) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.ACCOUNTS_API_URL() + "/verify?id=" + userId + "&code=" + code,
                type: "GET",
                success: (data) => { resolve(data); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async checkEmailConflict(email, id = "0") {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.ACCOUNTS_API_URL() + "/conflict?Id=" + id + "&Email=" + email,
                type: "GET",
                success: (hasConflict) => { resolve(hasConflict); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(false); }
            });
        });
    }
    
    static async modifyUser(userData) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.ACCOUNTS_API_URL() + "/modify/" + userData.Id,
                type: "PUT",
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem("bearerToken")
                },
                data: JSON.stringify(userData),
                success: (data) => { resolve(data); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async getUsers() {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.ACCOUNTS_API_URL(),
                type: "GET",
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem("bearerToken")
                },
                success: (data) => { resolve(data); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async promoteUser(userId) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.ACCOUNTS_API_URL() + "/promote",
                type: "POST",
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem("bearerToken")
                },
                data: JSON.stringify({ Id: userId }),
                success: (data) => { resolve(data); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async blockUser(userId) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.ACCOUNTS_API_URL() + "/block",
                type: "POST",
                contentType: 'application/json',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem("bearerToken")
                },
                data: JSON.stringify({ Id: userId }),
                success: (data) => { resolve(data); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    
    static async deleteUser(userId) {
        this.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.ACCOUNTS_API_URL() + "/remove/" + userId,
                type: "DELETE",
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem("bearerToken")
                },
                success: () => { resolve(true); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
}