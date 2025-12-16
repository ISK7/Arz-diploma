import type { data } from "../classes/data.ts";

const BASE_URL = "http://localhost:3000/pharmacygarden";

export async function logIn(password:string): Promise<string> {
  const res = await fetch(BASE_URL + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
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

export async function accept(ind: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + "/admin", {
    method: "PUT",
    headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${token}`},
    body: JSON.stringify({ind}),
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
