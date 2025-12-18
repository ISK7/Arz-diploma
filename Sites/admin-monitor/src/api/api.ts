import type { data } from "../classes/data.ts";
import type { key } from "../classes/key.ts";

const BASE_URL = "http://localhost:3000/pharmacygarden";

export async function logIn(login:string, password:string): Promise<string> {
  const res = await fetch(BASE_URL + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password })
  });

  if (res.ok) {
    const { token } = await res.json();
    localStorage.setItem("token", token);
  } else {
    return res.statusText.toString();
  }
  return "OK"
}

export async function getList(): Promise<data[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + "/admin", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`},
  });

  if (!res.ok) {
    throw new Error(`getList failed: ${res.status}`);
  }
    return res.json();
}

export async function getFile(name: string): Promise<string> {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + `/admin/${name}`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}`},
  });

  if (!res.ok) {
    throw new Error(`getFile failed: ${res.status}`);
  }
  return URL.createObjectURL(await res.blob());
}

export async function getKeys(): Promise<string[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + `/admin/keys`, {
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
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + "/admin", {
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
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + "/admin", {
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
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + "/admin/close", {
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
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + `/redactor`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`getFullKeys failed: ${res.status}`);
  }

  return res.json();
}

export async function addKey(newKey: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + `/redactor`, {
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
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + `/redactor`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ keyToDelete }),
  });

  if (!res.ok) {
    throw new Error(`deleteKey failed: ${res.status}`);
  }

  return res.json();
}
