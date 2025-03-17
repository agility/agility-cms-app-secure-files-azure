/* eslint-disable @next/next/no-img-element */
"use client"

import FileListing from "@/components/FileListing"
import { useAgilityAppSDK, closeModal, setHeight } from "@agility/app-sdk"
import { Button } from "@agility/plenum-ui"

export default function SelectBigCommerceProduct() {
	const { initializing, appInstallContext } = useAgilityAppSDK()

	const containerName = appInstallContext?.configuration?.containerName || ""
	const connectionString = appInstallContext?.configuration?.connectionString || ""

	if (initializing) {
		return null
	}


	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 min-h-0">
				<FileListing
					containerName={containerName}
					connectionString={connectionString}
					onSelect={(product) => {
						closeModal(product)
					}}
				/>
			</div>
			<div className="flex justify-end p-1">
				<Button
					type="alternative"
					label="Cancel"
					className="w-24"
					onClick={() => {
						closeModal(null)
					}}
				/>
			</div>
		</div>
	)
}
