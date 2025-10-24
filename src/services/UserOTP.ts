import {Authentication, OTP} from ".";
import UserModel from "../models/UserModel";
import {OTPType, UserType} from "../types/constants";
import {Password} from "../utils";

export default class UserOTP extends Authentication {

    public constructor() {
        super();
    }

    public async sendUserOTP(email: string, otpType: OTPType, userType: UserType) {
        try {
            let userProfile = await UserModel.findOne({ email: email }).select("firstName lastName email");

            if (userProfile) {
                const userName = userProfile.firstName + " " + userProfile.lastName;
                const otpService = new OTP(userProfile.email, otpType, userType);
                const otpServiceResult = await otpService.send(userName);
                return otpServiceResult
            }

            return super.responseData(404, true, "User was not found");
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async emailVerification(email: string, otpCode: string, userType: UserType) {
        const otp = new OTP(email, OTPType.Verification, userType);
        const otpServiceResult = await otp.confirmOTP(otpCode);

        if (otpServiceResult.json.error) return otpServiceResult;

        const deletedOTPServiceResult = await otp.deleteOTP();

        if (deletedOTPServiceResult.json.error) {
            return deletedOTPServiceResult;
        }

        try {
            const user = await UserModel.findOneAndUpdate({ email: email }, {
                $set: {
                    emailVerified: true
                }
            }, { new: true });

            if (user) {
                const token = this.generateUserToken({ id: user._id, userType: UserType.USER }, userType);

                return super.responseData(200, false, otpServiceResult.json.message, {
                    token,
                    user
                });
            }
            return super.responseData(404, true, "User was not found");
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }

    }
    public async otpConfirmation(email: string, otpCode: string, userType: UserType) {
        const otp = new OTP(email, OTPType.Reset, userType);

        const otpServiceResult = await otp.confirmOTP(otpCode);
        if (otpServiceResult.json.error) return otpServiceResult;
        const deletedOTPServiceResult = await otp.deleteOTP();
        if (deletedOTPServiceResult.json.error) return deletedOTPServiceResult;

        const token = this.generateOTPToken(email, userType);
        return super.responseData(200, false, "OTP confirmation was successful", { token: token });
    }

    public async passwordReset(email: string, password: string, otpCode: string) {
        const otp = new OTP(email, OTPType.Reset, UserType.USER);

        const otpServiceResult = await otp.confirmOTP(otpCode);
        if (otpServiceResult.json.error) return otpServiceResult;
        const deletedOTPServiceResult = await otp.deleteOTP();
        if (deletedOTPServiceResult.json.error) return deletedOTPServiceResult;

        try {
            const user = await UserModel.findOneAndUpdate({ email: email }, {
                $set: {
                    password: Password.hashPassword(password, this.storedSalt)
                }
            }, { new: true });

            if (user) {
                const token = this.generateUserToken({ id: user._id, userType: UserType.USER}, UserType.USER);
                return super.responseData(200, false, "Password has been reset successfully", {
                    user,
                    token
                });
            }
            return super.responseData(404, true, "User was not found");
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }
} 