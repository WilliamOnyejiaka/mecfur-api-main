import BaseService from "./bases/BaseService";
import JobModel from "../models/JobModel";
import {HttpStatus, QueueEvents, QueueNames, UserType} from "../types/constants";
import notify from "./notify";
import JobRequestModel from "../models/JobRequestModel";
import MechanicModel from "../models/MechanicModel";
import {RabbitMQ} from "./RabbitMQ";
import {Types} from 'mongoose';

export default class Request extends BaseService {

    public async request(mechanicId: string, jobId: string) {
        try {

            const query = await JobRequestModel.aggregate([
                {$match: {mechanicId: new Types.ObjectId(mechanicId), jobId: new Types.ObjectId(jobId)}},
                {$limit: 1},
                {
                    $lookup: {
                        from: 'jobs', // Must match MongoDB collection name (case-sensitive)
                        localField: 'jobId',
                        foreignField: '_id',
                        as: 'job',
                    },
                }
            ]).exec();

            const request = query[0];

            if (!request) return this.responseData(HttpStatus.NOT_FOUND, true, `Request was not found.`);
            return this.responseData(HttpStatus.OK, false, `Request was retrieved successfully.`, request);
        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async requests(mechanicId: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;

            const requestQuery = JobRequestModel.aggregate([
                {$match: {mechanicId: new Types.ObjectId(mechanicId)}},
                {$sort: {createdAt: -1}},
                {$skip: skip},
                {$limit: limit},
                {
                    $lookup: {
                        from: 'jobs', // Must match MongoDB collection name (case-sensitive)
                        localField: 'jobId',
                        foreignField: '_id',
                        as: 'job',
                    },
                }
            ]).exec();

            const [results, total] = await Promise.all([requestQuery, JobRequestModel.countDocuments({mechanicId: mechanicId})]);
            const data = {
                records: results,
                pagination: this.createPagination(page, limit, total),
            };
            return this.responseData(HttpStatus.OK, true, `Requests were retrieved successfully.`, data);

        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async createJob(issueType: string,
                           issueDescription: string,
                           pickupLon: number,
                           pickupLat: number,
                           vehicleMake: string,
                           vehicleModel: string,
                           vehicleYear: number,
                           vehiclePlate: string,
                           pickupAddress: string,
                           userId: string
    ) {
        try {

            const result = await JobModel.create({
                issueType,
                issueDescription,
                pickupLocation: {
                    type: "Point",
                    coordinates: [pickupLon, pickupLat]
                },
                pickupAddress,
                vehicleMake,
                vehicleModel,
                vehicleYear,
                vehiclePlate,
                userId,
                status: "pending"
            });
            // const nearByMechanics = await this.nearByMechanicsWithSkill(pickupLon, pickupLat, 50, 1, 20, [issueType]);

            // const mechanics = nearByMechanics.json.data?.records;
            // if (mechanics && mechanics.length > 0) {
            //     await Queues.postJob.add('job', {
            //         mechanics,
            //         jobId: result.id,
            //         jobDetails: result
            //     }, {jobId: `send-${Date.now()}`, priority: 1});
            // }
            // const data = {job: result, nearByMechanics: mechanics}

            return this.responseData(HttpStatus.OK, false, "Job was created successfully.", result);
        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async makeRequest(userId: string, mechanicId: string, jobId: string) {
        try {
            const mechanic = await MechanicModel.findById(mechanicId).select("-password");
            if (!mechanic) return this.responseData(404, true, "Mechanic was not found");

            const requestExists = await JobRequestModel.findOne({jobId: jobId, mechanicId: mechanicId});
            if (requestExists) return this.responseData(400, true, "A request to this mechanic for this job has already been created");

            const job = await JobModel.findById(jobId).lean();
            if (!job) return this.responseData(404, true, "Job was not found");

            const newRequest = await JobRequestModel.create({
                mechanicId: mechanicId,
                jobId: jobId
            });
            const message = {
                payload: {
                    mechanicId, job: job, userId
                },
                eventType: QueueEvents.MAKE_REQUEST,
            };
            await RabbitMQ.publishToExchange(QueueNames.REQUEST, QueueEvents.MAKE_REQUEST, message);
            return this.responseData(201, false, "Request has been created successfully", newRequest);
        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async declineJob(requestId: string, mechanicId: string) {
        try {
            const requestObjectId = new Types.ObjectId(requestId);
            const mechanicObjectId = new Types.ObjectId(mechanicId);

            const request = await JobRequestModel.aggregate([
                    {
                        $match: {
                            _id: requestObjectId,
                            mechanicId: mechanicObjectId,
                        },
                    },
                    {
                        $lookup: {
                            from: 'jobs', // Must match MongoDB collection name (case-sensitive)
                            localField: 'jobId',
                            foreignField: '_id',
                            as: 'job',
                        },
                    },
                    {
                        $unwind: {
                            path: '$job',
                            preserveNullAndEmptyArrays: true, // Keep document if no job found
                        },
                    },
                    {
                        $lookup: {
                            from: 'mechanics', // Must match MongoDB collection name
                            localField: 'mechanicId',
                            foreignField: '_id',
                            as: 'mechanic',
                        },
                    },
                    {
                        $unwind: {
                            path: '$mechanic',
                            preserveNullAndEmptyArrays: true, // Keep document if no mechanic found
                        },
                    },
                ]
            );

            if (!request[0]) return this.responseData(HttpStatus.NOT_FOUND, true, "Job was not found");

            const job = request[0].job;
            const status = request[0].job.status;
            if ([
                'searching',
                'accepted',
                'mechanic_enroute',
                'in_progress',
                'completed',
                'cancelled'
            ].includes(status)) return this.responseData(HttpStatus.BAD_REQUEST, true, `No action can be taken for this job because it has a ${status} status.`);

            const updatedRequest = await JobRequestModel.findOneAndUpdate(
                {_id: requestObjectId},
                {$set: {status: "declined"}},
                {returnDocument: 'after'}
            );

            const mechanic = request[0].mechanic;
            await notify({
                userId: job.userId,
                userType: UserType.USER,
                type: 'job_declined',
                data: {jobDetails: "updatedJob", mechanic: mechanic},
            });

            return this.responseData(HttpStatus.OK, false, "Job was accepted successfully.", updatedRequest);

        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    public async acceptJob(requestId: string, mechanicId: string) {
        try {
            const requestObjectId = new Types.ObjectId(requestId);
            const mechanicObjectId = new Types.ObjectId(mechanicId);

            const request = await JobRequestModel.aggregate([
                    {
                        $match: {
                            _id: requestObjectId,
                            mechanicId: mechanicObjectId,
                        },
                    },
                    {
                        $lookup: {
                            from: 'jobs', // Must match MongoDB collection name (case-sensitive)
                            localField: 'jobId',
                            foreignField: '_id',
                            as: 'job',
                        },
                    },
                    {
                        $unwind: {
                            path: '$job',
                            preserveNullAndEmptyArrays: true, // Keep document if no job found
                        },
                    },
                    {
                        $lookup: {
                            from: 'mechanics', // Must match MongoDB collection name
                            localField: 'mechanicId',
                            foreignField: '_id',
                            as: 'mechanic',
                        },
                    },
                    {
                        $unwind: {
                            path: '$mechanic',
                            preserveNullAndEmptyArrays: true, // Keep document if no mechanic found
                        },
                    },
                ]
            );

            if (!request[0]) return this.responseData(HttpStatus.NOT_FOUND, true, "Job was not found");

            const job = request[0].job;
            const status = request[0].job.status;
            if ([
                'searching',
                'accepted',
                'mechanic_enroute',
                'in_progress',
                'completed',
                'cancelled'
            ].includes(status)) return this.responseData(HttpStatus.BAD_REQUEST, true, `This job cannot be accepted because it has a ${status} status.`);

            const updatedJob = await JobModel.findOneAndUpdate(
                {_id: job._id},
                {$set: {status: "accepted", mechanicId: mechanicId}},
                {returnDocument: 'after'}
            );

            await JobRequestModel.findOneAndUpdate(
                {_id: requestObjectId},
                {$set: {status: "accepted"}},
                {returnDocument: 'after'}
            );

            const mechanic = request[0].mechanic;
            await notify({
                userId: job.userId,
                userType: UserType.USER,
                type: 'job_accepted',
                data: {jobDetails: updatedJob, mechanic: mechanic},
            });

            return this.responseData(HttpStatus.OK, false, "Job was accepted successfully.", updatedJob);

        } catch (error) {
            const {statusCode, message} = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }
}