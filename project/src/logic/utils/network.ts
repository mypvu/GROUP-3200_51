
export default async function download_from_url(url: URL) :Promise<ArrayBuffer> {

    const res = await fetch(url)
    if (!res.ok)
        throw new Error(`Fetch failed ${res.status} for ${url}`);

    return await res.arrayBuffer()
}

export async function download_json(url: URL): Promise<any> {

    const res = await fetch(url)
    if(!res.ok)
        throw new Error(`Fetch failed ${res.status} for ${url}`);

    return await res.json()
}
