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

export async function POST(request: NextRequest) {



	const connectionString = (request.headers.get("authorization") || '').replace('Bearer ', '')




	try {
		const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)

		const formData = await request.formData();

		const containerName = formData.get("containerName") as string
		const blobName = formData.get("blobName") as string
		const contentType = formData.get("contentType") as string

		const file = formData.get("file") as File;
		const arrayBuffer = await file.arrayBuffer();
		const buffer = new Uint8Array(arrayBuffer);

		const containerClient = blobServiceClient.getContainerClient(containerName)
		const blob = containerClient.getBlockBlobClient(blobName)

		const res = await blob.upload(buffer, buffer.length, {
			blobHTTPHeaders: {
				blobContentType: contentType
			}
		}
		)

		const props = await blob.getProperties()

		const blobItem: BlobListResponseItem = {
			name: blobName,
			properties: {
				etag: props.etag || "",
				createdOn: props.createdOn?.toISOString() || "",
				lastModified: props.lastModified?.toISOString() || "",
				contentLength: props.contentLength || 0,
				contentType: props.contentType || ""
			}
		}

		return NextResponse.json({ status: "success", blobItem });
	} catch (e) {
		console.error(e);
		return NextResponse.json({ status: "fail", error: e });
	}

}
