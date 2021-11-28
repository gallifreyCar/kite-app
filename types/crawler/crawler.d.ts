interface LoginCredential {
    username: string
    password: string
    cookie?: Cookie
}

type Cookie = { [key: string]: any }
