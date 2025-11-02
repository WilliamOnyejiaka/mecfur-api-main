import BaseService from "./bases/BaseService";
import { UploadArrResult, UploadedImageData, UploadResult } from "../types";
import { CdnFolders, ResourceType } from "../types/constants";
import Cloudinary from "./Cloudinary";

const bytesToKB = (bytes: number) => (bytes / 1024).toFixed(2); // Converts bytes to KB
const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2); // Converts bytes to MB

export default class ImageService extends BaseService {

    private readonly cloudinary = new Cloudinary();

    public constructor() {
        super();
    }

    public async uploadImagesArr(images: Express.Multer.File[], uploadFolder: CdnFolders): Promise<UploadArrResult> {
        try {
            // Parallelize image uploads
            const uploadPromises = images.map(async (image) => {
                const filename = image.filename;

                const { uploadedFiles, failedFiles } = await this.cloudinary.upload([image], ResourceType.IMAGE, uploadFolder as any);

                if (uploadedFiles.length > 0) {
                    const uploadedFile = uploadedFiles[0];
                    return {
                        success: true,
                        filename,
                        data: {
                            mimeType: uploadedFile.mimeType,
                            imageUrl: uploadedFile.url,
                            publicId: uploadedFile.publicId,
                            size: Number(uploadedFile.size),
                        },
                    };
                }

                return {
                    success: false,
                    filename,
                    message: failedFiles[0].error,
                };
            });

            // Wait for all uploads to complete
            const results = await Promise.all(uploadPromises);

            // Separate successful uploads and errors
            const successfulUploads = results.filter((result) => result.success) as {
                success: true;
                data: UploadedImageData;
            }[];

            const errors = results.filter((result) => !result.success) as {
                success: false;
                filename: string;
                message: string;
            }[];

            const uploadedImages = successfulUploads.map((upload) => {
                return upload.data
            });

            const publicIds = successfulUploads.map(upload => upload.data.publicId);

            if (errors.length > 0) {
                if (successfulUploads.length >= 1) {
                    const deleted = await this.cloudinary.deleteFiles(publicIds);
                    if (deleted.json.error) return { success: false, error: [{ fieldName: "unknown", message: "Something went wrong" }] };
                }
                return {
                    success: false,
                    error: errors.map((e) => ({ fieldName: e.filename, message: e.message })),
                };
            }

            return { success: true, data: uploadedImages, publicIds };
        } catch (error: any) {
            console.log(error);
            return {
                success: false,
                error: [{ fieldName: "unknown", message: error.message || "An unexpected error occurred" }],
            };
        }
    }

    public async uploadImages(images: Express.Multer.File[], uploadFolders: Record<string, CdnFolders>): Promise<UploadResult> {
        try {
            // Parallelize image uploads
            const uploadPromises = images.map(async (image) => {
                const fieldName = image.fieldname as CdnFolders;
                const uploadFolder = uploadFolders[fieldName];

                const { uploadedFiles, failedFiles } = await this.cloudinary.upload([image], ResourceType.IMAGE, uploadFolder as any);

                if (uploadedFiles.length > 0) {
                    const uploadedFile = uploadedFiles[0];
                    return {
                        success: true,
                        fieldName,
                        data: {
                            mimeType: uploadedFile.mimeType,
                            imageUrl: uploadedFile.url,
                            publicId: uploadedFile.publicId,
                            size: Number(uploadedFile.size),
                        },
                    };
                }

                return {
                    success: false,
                    fieldName,
                    message: failedFiles[0].error,
                };
            });

            // Wait for all uploads to complete
            const results = await Promise.all(uploadPromises);

            // Separate successful uploads and errors
            const successfulUploads = results.filter((result) => result.success) as {
                success: true;
                fieldName: string;
                data: UploadedImageData;
            }[];

            const errors = results.filter((result) => !result.success) as {
                success: false;
                fieldName: string;
                message: string;
            }[];

            // Construct the storeImages object
            const uploadedImages = successfulUploads.reduce((acc, { fieldName, data }) => {
                acc[fieldName] = data;
                return acc;
            }, {} as Record<string, UploadedImageData>);

            const publicIds = successfulUploads.map(upload => upload.data.publicId);

            if (errors.length > 0) {
                if (successfulUploads.length >= 1) {
                    const deleted = await this.cloudinary.deleteFiles(publicIds);
                    if (deleted.json.error) return { success: false, error: [{ fieldName: "unknown", message: "Something went wrong" }] };
                }
                return {
                    success: false,
                    error: errors.map((e) => ({ fieldName: e.fieldName, message: e.message })),
                };
            }

            return { success: true, data: uploadedImages, publicIds };
        } catch (error: any) {
            console.log(error);
            return {
                success: false,
                error: [{ fieldName: "unknown", message: error.message || "An unexpected error occurred" }],
            };
        }
    }

    public async deleteImages(publicIDs: string[]) {
        return await this.cloudinary.deleteFiles(publicIDs)
    }
}