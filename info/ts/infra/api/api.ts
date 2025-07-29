import axios, { AxiosError } from 'axios'
import { AppError } from '../../errors/app-error'

const api = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'text/html',
        'X-Requested-With': 'XMLHttpRequest',
    },
})

api.interceptors.request.use(
    (config) => {
        if (config.params?.noCache) {
            config.params = { ...config.params, _t: Date.now() }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

api.interceptors.response.use(
    (response) => {
        return response
    },
    (error: AxiosError) => {
        if (error.response) {
            throw new AppError(`Erro ${error.response.status}: ${error.response.statusText}`)
        } else if (error.request) {
            throw new AppError('Erro de conexão com o servidor')
        } else {
            throw new AppError(`Erro na requisição: ${error.message}`)
        }
    },
)

export { api }
