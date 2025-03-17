import { BlobSASPermissions, BlobServiceClient } from "@azure/storage-blob";
import { NextRequest, NextResponse } from "next/server";

export interface BlobListResponseItem {
	name: string
	label?: string
	properties: {
		etag: string
		createdOn: string
		lastModified: string
		contentLength: number
		contentType: string
	}
}

export interface BlobListResponse {
	items: BlobListResponseItem[]
	cursor: string
}

export async function GET(request: NextRequest, response: NextResponse) {

	const searchParams = request.nextUrl.searchParams
	const containerName = searchParams.get("containerName") || ""
	const blobName = searchParams.get("blobName") || ""
	const connectionString = (request.headers.get("authorization") || '').replace('Bearer ', '')

	const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
	const containerClient = blobServiceClient.getContainerClient(containerName)
	const blob = containerClient.getBlobClient(blobName)

	if (!blob.exists()) {
		console.error(`Blob with name ${blobName} does not exist in container ${containerName}`)
		return NextResponse.json({ url: null })
	}


	const permissions: BlobSASPermissions = new BlobSASPermissions();
	permissions.read = true;


	//get a URL that allows read access to the blob for 5 min
	const sasUrl = await blob.generateSasUrl({
		permissions,
		startsOn: new Date(),
		expiresOn: new Date(Date.now() + 5 * 60 * 1000)
	})

	return NextResponse.json({ url: sasUrl })
}
