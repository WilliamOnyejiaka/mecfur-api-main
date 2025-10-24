import mongoose from "mongoose";
import {Cloudinary, Token} from ".";
import {env} from "../config";
import UserModel from "../models/UserModel"
import {FailedFiles, UploadedFiles} from "../types";
import {CdnFolders, HttpStatus, ResourceType, UserType} from "../types/constants";
import {Password} from "../utils";
import BaseService from "./bases/BaseService";
import {TokenBlackList, UserCache} from "../cache";
import {EnvKey} from "../config/env";
import MechanicModel from "../models/MechanicModel";

// * Authentication class for various users
export default class Authentication extends BaseService {


    protected readonly storedSalt: string = env(EnvKey.STORED_SALT)!;
    protected readonly tokenSecret: string = env(EnvKey.TOKEN_SECRET)!;
    protected readonly secretKey: string = env(EnvKey.SECRET_KEY)!;
    protected readonly tokenBlackListCache: TokenBlackList = new TokenBlackList();
    protected readonly userCache: UserCache = new UserCache(UserType.USER);
    protected readonly mechanicCache: UserCache = new UserCache(UserType.MECHANIC);


    private generateToken(data: any, role: string, expiresIn: string = "100y") {
        return Token.createToken(this.tokenSecret, data, [role], expiresIn);
    }

    protected generateOTPToken(email: string, role: string, expiresIn: string = "5m") {
        return this.generateToken({email: email}, role, expiresIn);
    }

    protected generateUserToken(data: { id: mongoose.Types.ObjectId, userType: UserType }, role: UserType) {
        return this.generateToken(data, role);
    }

    // protected generateAdminToken(admin: any) {
    //     return this.generateToken(admin, "admin");
    // }

    // * User(normal user) sign up service 
    public async signUp(signUpData: any) {
        try {

            let userEmailExists = await UserModel.findOne({email: signUpData.email});
            if (userEmailExists) return this.responseData(400, true, `Email already exists.`);

            let userPhoneNumberExists = await UserModel.findOne({phone: signUpData.phone});
            if (userPhoneNumberExists) return this.responseData(400, true, `Phone number already exists.`);

            let uploadedFiles: UploadedFiles[] = [], publicIds: string[] = [], failedFiles: FailedFiles[] = [];

            // * Checking if user profile picture exists
            if (signUpData.file) {
                // * Uploading to cloudinary
                const cloudinary = new Cloudinary();

                ({
                    uploadedFiles,
                    failedFiles,
                    publicIds
                } = await cloudinary.upload([signUpData.file], ResourceType.IMAGE, CdnFolders.PROFILEPICTURE));
                if (failedFiles?.length) {
                    return this.responseData(400, true, "File upload failed", failedFiles);
                }
            }

            signUpData.password = Password.hashPassword(signUpData.password, this.storedSalt);

            const user = await UserModel.create({
                ...signUpData,
                profilePicture: {
                    url: uploadedFiles[0]?.url || "",
                    publicId: uploadedFiles[0]?.publicId || "",
                },
                isVerified: false,
                isActive: true
            });

            // * Creating jwt for future authentications
            const token = this.generateUserToken({id: user._id, userType: UserType.USER}, UserType.USER);

            await this.userCache.set(user._id.toString(), user);

            const data = {user: {...user.toJSON(), password: undefined}, token};

            return this.responseData(201, false, "User has been created successfully", data);

        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    // * User(normal user) login service 
    public async login(email: string, password: string) {
        try {
            let user = await UserModel.findOne({email: email}).lean();

            if (user) {
                const hashedPassword = user.password!;
                const validPassword = Password.compare(password, hashedPassword, this.storedSalt);

                if (validPassword) {
                    const token = this.generateUserToken({id: user._id, userType: UserType.USER}, UserType.USER);

                    await this.userCache.set(user._id.toString(), user);
                    return this.responseData(200, false, "User has been logged in successfully", {user: {...user,password: undefined}, token});
                }
                return super.responseData(HttpStatus.BAD_REQUEST, true, "Invalid password");
            }
            return this.responseData(404, true, "User was not found")
        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async mechanicSignUp(signUpData: any) {
        try {

            let userEmailExists = await MechanicModel.findOne({email: signUpData.email});
            if (userEmailExists) return this.responseData(400, true, `Email already exists.`);

            let userPhoneNumberExists = await UserModel.findOne({phone: signUpData.phone});
            if (userPhoneNumberExists) return this.responseData(400, true, `Phone number already exists.`);

            let uploadedFiles: UploadedFiles[] = [], publicIds: string[] = [], failedFiles: FailedFiles[] = [];

            // * Checking if user profile picture exists
            if (signUpData.file) {
                // * Uploading to cloudinary
                const cloudinary = new Cloudinary();

                ({
                    uploadedFiles,
                    failedFiles,
                    publicIds
                } = await cloudinary.upload([signUpData.file], ResourceType.IMAGE, CdnFolders.PROFILEPICTURE));
                if (failedFiles?.length) {
                    return this.responseData(400, true, "File upload failed", failedFiles);
                }
            }

            signUpData.password = Password.hashPassword(signUpData.password, this.storedSalt);

            const user = await MechanicModel.create({
                ...signUpData,
                profilePicture: {
                    url: uploadedFiles[0]?.url || "",
                    publicId: uploadedFiles[0]?.publicId || "",
                },
                location: {
                    type: "Point",
                    coordinates: [Number(signUpData.longitude), Number(signUpData.latitude)]
                },
                isVerified: false,
                isActive: true
            });

            // * Creating jwt for future authentications
            const token = this.generateUserToken({id: user._id, userType: UserType.MECHANIC}, UserType.MECHANIC);

            await this.mechanicCache.set(user._id.toString(), user);

            const data = {user: {...user.toJSON(), password: undefined}, token};

            return this.responseData(201, false, "User has been created successfully", data);

        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async mechanicLogin(email: string, password: string) {
        try {
            let user = await MechanicModel.findOne({email: email}).lean();

            if (user) {
                const hashedPassword = user.password!;
                const validPassword = Password.compare(password, hashedPassword, this.storedSalt);

                if (validPassword) {
                    const token = this.generateUserToken({id: user._id, userType: UserType.MECHANIC}, UserType.MECHANIC);

                    await this.mechanicCache.set(user._id.toString(), user);
                    return this.responseData(200, false, "User has been logged in successfully", {user: {...user,password: undefined}, token});
                }
                return super.responseData(HttpStatus.BAD_REQUEST, true, "Invalid password");
            }
            return this.responseData(404, true, "User was not found")
        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }


    public async logOut(token: string) {
        const tokenValidationResult: any = Token.validateToken(token, ["any"], this.tokenSecret);

        if (tokenValidationResult.error) {
            return super.responseData(400, true, tokenValidationResult.message);
        }

        const decoded = Token.decodeToken(token);
        const blacklisted = await this.tokenBlackListCache.set(token, {
            data: decoded.data,
            types: decoded.types
        }, decoded.expiresAt);

        return blacklisted ?
            super.responseData(200, false, "User has been logged out successfully") :
            super.responseData(500, true, "Something went wrong");
    }
}