"use client"
import { BlobListResponseItem } from "@/app/api/get-files/route";
import { useUpload } from "@/hooks/useUpload";
import axios from "axios";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";

interface Props {
	containerName: string
	connectionString: string
	children: any
	readOnly: boolean | undefined
	onUpload: (file: BlobListResponseItem) => void
	className?: string
}

export const DropZone = ({ children, readOnly, connectionString, containerName, className, onUpload }: Props) => {

	const divRef = useRef<HTMLDivElement>(null);

	const [isDragging, setIsDragging] = useState(false);

	const { loading, uploadProgress, uploadFile } = useUpload({ connectionString, containerName, onUpload });
	// const loading = true
	// const uploadProgress = 10
	// const uploadFile = (file: File) => { }


	//initialize the drag-drop
	useEffect(() => {
		let active = true;
		const container = divRef.current;
		if (!container || readOnly) return;

		let dragHoverTimeout: any = -1;

		const dragOver = (ev: DragEvent) => {
			clearTimeout(dragHoverTimeout);

			if (!active) return;
			dragHoverTimeout = setTimeout(function () {
				if (!active) return;
				setIsDragging(false);
			}, 100);
			setIsDragging(true);
			ev.preventDefault();
			ev.stopPropagation();
		};

		const dragEnter = (ev: DragEvent) => {
			if (!active) return;
			setIsDragging(true);
			ev.preventDefault();
			ev.stopPropagation();
		};

		const drop = (ev: DragEvent) => {
			if (!active) return;

			if (ev.dataTransfer) {


				if (ev.dataTransfer.files.length > 0) {
					clearTimeout(dragHoverTimeout);
					setIsDragging(false);
					ev.preventDefault();
					ev.stopPropagation();

					const fileToUpload = ev.dataTransfer.files[0];

					if (fileToUpload) {
						uploadFile(fileToUpload);
					}
				}
			}
		};

		container.ondragover = dragOver;
		container.ondragenter = dragEnter;
		container.ondrop = drop;

		return () => {
			active = false;
			if (container) {
				container.ondragover = null;
				container.ondragenter = null;
				container.ondrop = null;
			}
		};
	}, [
		divRef,
		readOnly,
	]);


	return <div ref={divRef} className={classNames("relative h-full w-full", className)} >


		<div className={classNames("transition-all", (isDragging || loading) ? "blur-sm" : "", className)}>{children}</div>

		{isDragging && <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
			<div className="px-2 py-1 bg-gray-100 rounded shadow">Drop files here to upload...</div>
		</div>}

		{loading && <div className="absolute top-0 left-0 w-full h-full  flex items-center justify-center">
			<div className="px-2 py-1 bg-gray-100 rounded shadow">Uploading - {uploadProgress}%...</div>
		</div>}
	</div>

}