const BASE_URL = "http://localhost:3000/pharmacygarden/reg";

export async function request(request) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" , "Access-Control-Allow-Origin": "*"},
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`request failed: ${res.status}`);
  }

  return res.json();
}
