import BaseService from "./bases/BaseService";
import {OTPType, UserType} from "../types/constants";
import path from "path";
import OTPCache from "../cache/OTPCache";
import randomInt from "../utils/randomInt";
import Email from "./Email";


export default class OTP extends BaseService {

    private readonly cache: OTPCache;

    public constructor(private readonly email: string, private readonly otpType: OTPType, userType: UserType) {
        super();
        const cachePreKey = otpType + "-" + userType;
        this.cache = new OTPCache(cachePreKey);
    }

    private generateOTP() {
        let otp: string = "";
        for (let i = 0; i <= 5; i++) otp += randomInt(0, 9);
        return otp;
    }

    private async storeOTP(otpCode: string) {
        return await this.cache.set(this.email, otpCode);
    }

    private emailSubject() {
        return {
            [OTPType.Verification]: "Email Verification",
            [OTPType.Reset]: "Password Reset"
        }[this.otpType];
    }

    private emailTemplate() {
        return {
            [OTPType.Verification]: path.join(__dirname, './../views', "email.ejs"),
            [OTPType.Reset]: path.join(__dirname, './../views', "reset-password.ejs")
        }[this.otpType];
    }

    private async sendOTP(templateData: any, templatePath: string) {
        const email = new Email();
        const emailContent = await email.getEmailTemplate(templateData, templatePath);
        const mailResult = await email.sendEmail(
            "Ecommerce Api",
            this.email,
            this.emailSubject(),
            emailContent as string
        );
        return mailResult;
    }

    public async send(userFullName: string) {
        const otpCode = this.generateOTP();
        const storedOTP = await this.storeOTP(otpCode);

        if (storedOTP) {
            const templateData = {
                name: userFullName,
                otpCode: otpCode
            };
            const sentOTP = await this.sendOTP(templateData, this.emailTemplate());
            const error: boolean = sentOTP ? false : true;
            const statusCode: number = sentOTP ? 200 : 500;
            const message: string = sentOTP ? "OTP has been sent successfully" : "Something went wrong";

            return super.responseData(statusCode, error, message);
        }
        return super.responseData(500, true, "Failed to cache");
    }

    public async confirmOTP(otpCode: string) {
        const cacheResult = await this.cache.get(this.email);

        if (cacheResult.error) {
            return super.responseData(500, cacheResult.error, "Something went wrong");
        }

        if (!cacheResult.otpCode) {
            return super.responseData(404, true, "OTP code was no found");
        }

        const validOTPCode = cacheResult.otpCode === otpCode;
        const message = validOTPCode ? "Email has been verified successfully" : "Invalid otp";
        const statusCode = validOTPCode ? 200 : 401;
        const error = statusCode == 200;
        return super.responseData(statusCode, !error, message);
    }

    public async deleteOTP() {
        const deleted: boolean = await this.cache.delete(this.email);
        const message: string | null = deleted ? null : "Something went wrong";
        const statusCode: number = deleted ? 500 : 200;
        return super.responseData(statusCode, !deleted, message);
    }
}