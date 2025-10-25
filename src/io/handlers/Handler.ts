
export default class Handler {

    public static responseData(error: boolean, message: string | null, data: any = {}) {
        return {
            error: error,
            message: message,
            data: data
        };
    }
}