import type { data } from "../classes/data.ts";
import type { key } from "../classes/key.ts";
import { useAccountStore } from "../storage/account.store.ts";
import { useRightsStore } from "../storage/rights.store.ts";

const BASE_URL = "http://localhost:3000/pharmacygarden";
let accessToken: string | null = null
let refreshPromise: Promise<string> | null = null;

export async function authFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers)

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  if (response.status !== 401) {
    return response
  }

  // если это refresh-запрос — выходим
  if (input.toString().includes('/refresh')) {
    throw new Error('Unauthorized')
  }

  if (!refreshPromise) {
    refreshPromise = refreshToken()
      .finally(() => (refreshPromise = null))
  }

  const newToken = await refreshPromise
  accessToken = newToken

  headers.set('Authorization', `Bearer ${newToken}`)

  return fetch(input, {
    ...init,
    headers,
  })
}

export async function refreshToken(): Promise<string> {
  const refresh_token = localStorage.getItem("refresh_token");
  const deviceId = localStorage.getItem("deviceId");
  if (!refresh_token || !deviceId) {
    throw new Error("No refresh token or device ID found");
  }
  const res = await fetch(BASE_URL + "/refresh", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token, deviceId })
  });

  if(res.status == 401) {
    throw new Error("Unauthorized");
  }

  if (res.ok) {
    const { accessToken } = await res.json();
    localStorage.setItem("access_token", accessToken);
    return accessToken;
  } else {
    throw new Error(`refreshToken failed: ${res.status}`);
  }
}

export async function checkRights(): Promise<boolean> {
  const token = localStorage.getItem("access_token");
  const login = useAccountStore.getState().login;
  const password = useAccountStore.getState().password;
  const rights = useRightsStore.getState().rights;
  
  const res = await authFetch(BASE_URL + "/rights", {
    method: "PUT",
    headers: {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"},
    body: JSON.stringify({ login, password, rights })
  })

  if (res.ok) {
    return true;
  } else {
    console.log(res.statusText.toString())
    return false;
  }
}

export async function logIn(login:string, password:string): Promise<string> {
  const deviceId = localStorage.getItem('deviceId') ?? crypto.randomUUID()
  localStorage.setItem('deviceId', deviceId)

  const res = await fetch(BASE_URL + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password, deviceId })
  });
  
  if (res.ok) {
    const { access_token, refresh_token, rights } = await res.json();
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    return rights;
  } else {
    console.log(res.statusText.toString());
    throw new Error(`logIn failed: ${res.status}`);
  }
}

export async function getList(): Promise<data[]> {
  const token = localStorage.getItem("access_token");
  const res = await authFetch(BASE_URL + "/admin", {
    method: "GET",
    headers: {"Authorization": `Bearer ${token}`},
  });

  if (!res.ok) {
    throw new Error(`getList failed: ${res.status}`);
  }
  return res.json();
}

export async function getFile(img: string): Promise<string> {
  const token = localStorage.getItem("access_token");
  const res = await authFetch(BASE_URL + `/admin/${img}`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}`},
  });

  if (!res.ok) {
    throw new Error(`getFile failed: ${res.status}`);
  }
  return URL.createObjectURL(await res.blob());
}

export async function getKeys(): Promise<string[]> {
  const token = localStorage.getItem("access_token");
  const res = await authFetch(BASE_URL + `/admin/keys`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`getKeys failed: ${res.status}`);
  }
  const resJson = await res.json();
  const ans = resJson.map((k: key) => k.key);
  return ans;
}


export async function accept(ind: number, key: string, date: string) {
  const token = localStorage.getItem("access_token");
  const res = await authFetch(BASE_URL + "/admin", {
    method: "PUT",
    headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${token}`},
    body: JSON.stringify({ind, key, date}),
  });

  if (!res.ok) {
    throw new Error(`accept failed: ${res.status}`);
  }

  return res.json();
}

export async function refuse(ind: number) {
  const token = localStorage.getItem("access_token");
  const res = await authFetch(BASE_URL + "/admin", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${token}`},
    body: JSON.stringify({ind}),
  });

   if (!res.ok) {
    throw new Error(`refuse failed: ${res.status}`);
  }

  return res.json();
}

export async function close(ind: number) {
  const token = localStorage.getItem("access_token");
  const res = await authFetch(BASE_URL + "/admin/close", {
    method: "PUT",
    headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${token}`},
    body: JSON.stringify({ind}),
  });
    if (!res.ok) {
      throw new Error(`close failed: ${res.status}`);
  }
  return res.json();;
}

export async function getFullKeys(): Promise<key[]> {
  const token = localStorage.getItem("access_token");
  const res = await authFetch(BASE_URL + `/redactor`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`getFullKeys failed: ${res.status}`);
  }

  return res.json();
}

export async function addKey(newKey: string) {
  const token = localStorage.getItem("access_token");
  const res = await authFetch(BASE_URL + `/redactor`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ newKey }),
  });

  if (!res.ok) {
    throw new Error(`addKey failed: ${res.status}`);
  }

  return res.json();
}

export async function deleteKey(keyToDelete: string) {
  const token = localStorage.getItem("access_token");
  const res = await authFetch(BASE_URL + `/redactor`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ keyToDelete }),
  });

  if (!res.ok) {
    throw new Error(`deleteKey failed: ${res.status}`);
  }

  return res.json();
}
