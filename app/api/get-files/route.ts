import { BlobServiceClient } from "@azure/storage-blob";
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
	const cursor = searchParams.get("cursor") || ""
	const connectionString = (request.headers.get("authorization") || '').replace('Bearer ', '')
	const search = `${searchParams.get("search") || ""}`.replaceAll("\"", "")

	const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
	const containerClient = blobServiceClient.getContainerClient(containerName)

	const iterator = containerClient.listBlobsFlat({
		prefix: search,

	}).byPage({
		continuationToken: cursor || undefined,
		maxPageSize: 20,

	});
	const fileRes = (await iterator.next()).value;

	let data: BlobListResponse = {
		items: [],
		cursor: fileRes.continuationToken
	}


	for (const blob of fileRes.segment.blobItems) {

		const blobItem: BlobListResponseItem = {
			name: blob.name,
			properties: {
				etag: blob.properties.etag,
				createdOn: blob.properties.createdOn,
				lastModified: blob.properties.lastModified,
				contentLength: blob.properties.contentLength,
				contentType: blob.properties.contentType
			}
		}

		data.items.push(blobItem)
	}

	return NextResponse.json(data)
}
