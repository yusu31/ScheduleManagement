import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

// リクエスト時：localStorageから認証ヘッダーを自動付与（DeviseTokenAuth対応）
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('access-token')
    const client = localStorage.getItem('client')
    const uid = localStorage.getItem('uid')

    if (accessToken && client && uid) {
      config.headers['access-token'] = accessToken
      config.headers['client'] = client
      config.headers['uid'] = uid
    }
  }
  return config
})

// レスポンス受信時：新しい認証ヘッダーをlocalStorageに保存 / 401なら認証クリア＋リダイレクト
apiClient.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined') {
      const accessToken = response.headers['access-token']
      const client = response.headers['client']
      const uid = response.headers['uid']

      if (accessToken) {
        localStorage.setItem('access-token', accessToken)
        if (client) localStorage.setItem('client', client)
        if (uid) localStorage.setItem('uid', uid)
      }
    }
    return response
  },
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('access-token')
      localStorage.removeItem('client')
      localStorage.removeItem('uid')
      window.location.href = '/auth/sign-in'
    }
    return Promise.reject(error)
  }
)

export default apiClient
