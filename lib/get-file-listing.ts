import { BlobListResponse } from "@/app/api/get-files/route"

interface Props {
	connectionString: string
	containerName: string
	search: string
	cursor: string
}

export const getFileListing = async ({ connectionString, containerName, cursor, search }: Props) => {
	const res = await fetch(`/api/get-files?containerName=${encodeURIComponent(containerName)}&search=${encodeURIComponent(search)}&cursor=${encodeURIComponent(cursor)}`, {
		method: "GET",
		headers: {
			'Accept': 'application/json',
			'Authorization': 'Bearer ' + connectionString,
		}
	})

	if (res.ok) {
		const data = await res.json() as BlobListResponse

		return data || null
	}

	throw new Error("Could not get Files")

}