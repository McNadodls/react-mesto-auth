class Auth {
  constructor(baseUrl) {
    this._baseUrl = baseUrl;
  }

  _checkResponse(response) {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(`Ошибка: ${response.status}`);
  } 

  enterError (err) {
    Promise.reject(`Ошибка: ${err.status}`);
  }

  singnup(email, password) {
    return fetch(`${this._baseUrl}/signup`, {
      method: 'POST',
      headers:{
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        "email": email,
        "password": password
      })
    })
    .then(this._checkResponse)
  }

  signin(email, password) {
    return fetch(`${this._baseUrl}/signin`, {
      method: 'POST',
      headers:{
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        "email": email,
        "password": password
      })
    })
    .then(this._checkResponse)
  }

  getToken (jwt) {
    return fetch(`${this._baseUrl}/users/me`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${jwt}`
        }
    })
        .then(this._checkResponse)
  }
}
export default new Auth('https://auth.nomoreparties.co'); 