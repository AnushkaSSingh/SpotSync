const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/+$/, '')

const TOKEN_KEY = 'spotsync_access_token'

function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  if (API_BASE_URL.endsWith('/api') && cleanPath.startsWith('/api/')) {
    return `${API_BASE_URL}${cleanPath.slice(4)}`
  }

  return `${API_BASE_URL}${cleanPath}`
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token) {
  if (!token) {
    throw new Error('The server did not return an access token.')
  }

  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest(path, options = {}) {
  const token = getToken()

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(getApiUrl(path), {
      ...options,
      headers,
    })
  } catch {
    throw new Error(
      'Cannot connect to the SpotSync server. Check whether the backend is running.'
    )
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof data === 'string'
        ? data
        : typeof data?.detail === 'string'
          ? data.detail
          : Array.isArray(data?.detail)
            ? data.detail.map(item => item.msg).join(', ')
            : data?.message || `Request failed (${response.status})`

    if (response.status === 401) {
      clearToken()
    }

    throw new Error(message)
  }

  return data
}

export async function loginUser(email, password) {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  saveToken(data?.access_token)

  return data
}

export async function getCurrentUser() {
  return apiRequest('/api/auth/me')
}

export function logoutUser() {
  clearToken()
}
