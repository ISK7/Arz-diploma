const BASE_URL = "http://localhost:3000/pharmacygardenadmin";

export async function getList(): Promise<string> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" , "Access-Control-Allow-Origin": "*"},
  });
  return res.json();
}


export async function accept(ind: number) {
  const res = await fetch(BASE_URL, {
    method: "UPDATE",
    headers: { "Content-Type": "application/json" , "Access-Control-Allow-Origin": "*"},
    body: JSON.stringify(ind),
  });
  return res.json();
}

export async function refuse(ind: number) {
  const res = await fetch(BASE_URL, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" , "Access-Control-Allow-Origin": "*"},
    body: JSON.stringify(ind),
  });
  return res.json();
}
