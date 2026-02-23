const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY as string

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    let message: string
    try {
      const json = JSON.parse(text)
      message = json.statusMessage || json.message || text
    } catch {
      message = text || response.statusText
    }
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-admin-api-key': ADMIN_API_KEY,
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  let url = `${API_BASE_URL}${path}`
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value))
      }
    }
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }
  const response = await fetch(url, { headers: headers() })
  return handleResponse<T>(response)
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}
