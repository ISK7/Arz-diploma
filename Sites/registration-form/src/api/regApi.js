const BASE_URL = "http://localhost:3000/pharmacygarden/reg";

export async function request(request) {
  const file = request.file;
  const formData = new FormData();
  formData.append('name', request.name);
  formData.append('second_name', request.second_name);
  formData.append('patronim', request.patronim);
  formData.append('email', request.email);
  formData.append('number', request.number);
  formData.append('file', file);
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Access-Control-Allow-Origin": "*"},
    body: formData,
  });

  // console.log(formData);

  if (!res.ok) {
    throw new Error(`request failed: ${res.status}`);
  }

  return res.json();
}
