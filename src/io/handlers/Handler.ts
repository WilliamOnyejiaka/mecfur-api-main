
export default class Handler {

    public static responseData(error: boolean, message: string | null, data: any = {}) {
        return {
            error: error,
            message: message,
            data: data
        };
    }

    public static handleRepoError(repoResult: any) {
        if (repoResult.error) {
            return this.responseData(true, repoResult.message as string);
        }
        return null;
    }
}