export enum UserType {
    ADMIN = "admin",
    USER = "user",
    MECHANIC = "mechanic",
};

export enum OTPType {
    Reset = "passwordReset",
    Verification = "emailVerification"
};

export enum Events {
    APP_ERROR = "appError",
    ONLINE_PRESENCE = "onlinePresence",
    NEARBY_MECHANICS="nearByMechanics",
    TRACK_MECHANIC="trackMechanic"
}

export enum Namespaces {
    CHAT = '/chat',
    PRESENCE = '/presence',
    NOTIFICATION = '/notification',
    BASE = '/api/v1/socket',
    SUPPORTCHAT = '/supportChat'
}

export enum NotificationEvents {
    NOTIFICATION = "notification"
}

export enum ServiceResultDataType {
    HTTP = 'http',
    SOCKET = 'socket'
}

export interface SocketData {
    statusCode: number,
    error: boolean,
    message: string | null,
    data?: any
};

export enum ResourceType {
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "video",
    PDF = "raw",
    AUTO = "auto"
};

export enum CdnFolders {
    PROFILEPICTURE = "mecfur-cdn/profile-pictures/users",
    USERPICTURES = "mecfur-cdn/profile-pictures/users/pictures"

}

export enum AdminPermission {
    MANAGE_ALL = "manage_all",
    MANAGE_ADMINS = "manage_admins",
    MANAGE_USERS = "manage_users",
    MANAGE_VENDORS = "manage_vendors",
    MANAGE_USERS_PARTIAL = "manage_users_partial",
    MANAGE_VENDORS_PARTIAL = "manage_vendors_partial",
    VIEW_REPORTS = "view_reports",
    MANAGE_CONTENT = "manage_content",
    MANAGE_FINANCE = "manage_finance",
    MANAGE_SUPPORT = "manage_support",
    MANAGE_HR = "manage_hr",
    MANAGE_IT = "manage_it",
    ENSURE_COMPLIANCE = "ensure_compliance",
    VENDOR_PORTAL_ACCESS = "vendor_portal_access",
    ANY = "any"
};

export enum NotificationStatus {
    SENT = "SENT",
    PENDING = "PENDING",
    VIEWED = "VIEWED"
}


export enum HttpStatus {
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTI_STATUS = 207,
    ALREADY_REPORTED = 208,
    IM_USED = 226,
    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    USE_PROXY = 305,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    IM_A_TEAPOT = 418,
    MISDIRECTED_REQUEST = 421,
    UNPROCESSABLE_ENTITY = 422,
    LOCKED = 423,
    FAILED_DEPENDENCY = 424,
    TOO_EARLY = 425,
    UPGRADE_REQUIRED = 426,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
    VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFICIENT_STORAGE = 507,
    LOOP_DETECTED = 508,
    NOT_EXTENDED = 510,
    NETWORK_AUTHENTICATION_REQUIRED = 511
}

export const HttpStatusMessage: Record<HttpStatus, string> = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required"
};

export function imageFolders(key: string) {
    const basePath = "mecfur-cdn";
    const profilePicture = `${basePath}/profile-picture`;

    return {
        'userProfilePic': profilePicture + "/user",
        'adminProfilePic': profilePicture + "/admin",
    }[key];
}

export enum QueueType {
    NOTIFICATION = 'notification-queue',
    POST_JOB = "post-job-queue",
}

export const notificationType = ['system' , 'request', 'job_accepted' ,'job_declined', 'job_cancelled' , 'job_completed'];

export const exchange = "mecfur_exchange";
export enum QueueNames {
    USER="mecfur_user_queue",
    NOTIFICATION="mecfur_notification_queue",
    REQUEST="mecfur_request_queue",
    LOCATION="location_request_queue"
}

export enum QueueEvents {
    USER_UPDATE="",
    NOTIFICATION_NOTIFY="notification.notify",
    USER_LIKE ="user.like",
    USER_VISIT="user.visit",
    MAKE_REQUEST="request.make_request",
    CREATE_JOB="request.create_job",
    LOCATION_UPDATE="location.update",
    LOCATION_NEAR_BY="location.near_by",
    TRACK_MECHANIC="location.track_mechanic"
}
