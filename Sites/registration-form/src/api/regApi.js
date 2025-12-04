const BASE_URL = "http://localhost:3000/pharmacygardenreg";

export async function request(request) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" , "Access-Control-Allow-Origin": "*"},
    body: JSON.stringify(request),
  });
  return res.json();
}
