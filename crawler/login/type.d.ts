import { Worker } from 'tesseract.js'

interface LoginCredential {
    username: string
    password: string
    cookie?: Cookie
}

type Cookie = { [key: string]: any }

type TesseractWorker = Worker | undefined
