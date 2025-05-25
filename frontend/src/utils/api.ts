const HOST = "http://localhost:3232";

async function queryAPI(endpoint: string, query_params: Record<string, string>) {
  // If query_params is not empty, add it to the URL, otherwise, skip the '?'.
  let url = `${HOST}/${endpoint}`;
  if (Object.keys(query_params).length > 0) {
    const paramsString = new URLSearchParams(query_params).toString();
    url += `?${paramsString}`;
  }
  
  console.log("Url: ", url)
  const response = await fetch(url);
  if (!response.ok) {
    console.error(response.status, response.statusText);
  }
  return response.json();
}

export async function addPin(uid: string, lat: string, long: string) {
  return await queryAPI("add-pin", {
    uid: uid,
    lat: lat,
    long: long 
  });
}

export async function getPins() {
  return await queryAPI("all-pins", {});
}

export async function clearUser(uid: string) {
  return await queryAPI("clear-user", {
    uid: uid,
  });
}

export async function getGeoData(minLat: string, maxLat: string, minLong: string, maxLong: string) {
  return await queryAPI("access-geodata", {
    minlat : minLat,
    maxlat : maxLat,
    minlong: minLong,
    maxlong: maxLong,
  })
}

export async function searchGeoData(term: string) {
  return await queryAPI("redline-term", { term });
}