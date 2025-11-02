import S2 from '@radarlabs/s2';
import MechanicLocationModel from "../models/LocationModel";
import {Coordinates, MechanicLocation} from "../types";
import {QueueEvents, QueueNames} from "../types/constants";
import {RabbitMQ} from "./RabbitMQ";
import BaseService from "./bases/BaseService";
import redisClient from "../config/redis";
import logger from "../config/logger";

const S2_LEVEL = 14;

export default class Location extends BaseService {

    private coordinatesKey: string = "location:mechanic";

    /**
     * Validates if latitude and longitude are within valid ranges.
     * @param latitude The latitude value (-90 to 90 degrees).
     * @param longitude The longitude value (-180 to 180 degrees).
     * @returns True if valid, false otherwise.
     */
    public static isValidLatLng(latitude: number, longitude: number): boolean {
        // Check for non-numeric or undefined values
        if (
            typeof latitude !== 'number' ||
            typeof longitude !== 'number' ||
            isNaN(latitude) ||
            isNaN(longitude)
        ) {
            return false;
        }

        // Check latitude range: -90 to 90 degrees
        if (latitude < -90 || latitude > 90) {
            return false;
        }

        // Check longitude range: -180 to 180 degrees
        if (longitude < -180 || longitude > 180) {
            return false;
        }

        return true;
    }

    /**
     * Validates coordinates object.
     * @param coords Object containing latitude and longitude.
     * @returns True if valid, false otherwise.
     */
    public static isValidCoordinates(coords: Partial<Coordinates>): boolean {
        if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
            return false;
        }
        return Location.isValidLatLng(coords.latitude, coords.longitude);
    }


    public static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }


    public async updateMechanicLocation(location: MechanicLocation): Promise<boolean> {
        const {mechanicId, latitude, longitude, timestamp} = location;

        // Convert lat/lng to S2 cell ID using @radarlabs/s2
        const latLng = new S2.LatLng(latitude, longitude);
        const cellId = new S2.CellId(latLng);
        const cellAtLevel = cellId.parent(S2_LEVEL);
        const cellToken = cellAtLevel.token();

        const mechanic = {
            mechanicId,
            latitude,
            longitude,
            s2CellId: cellToken,
            lastUpdated: timestamp
        };

        const cellEx = 15;

        // queue redis logic
        try {
            // Store in Redis (TTL of 30 seconds) and cell set
            await redisClient.setex(`${this.coordinatesKey}:${mechanicId}`, cellEx, JSON.stringify(mechanic));
            await redisClient.sadd(`cell:${cellToken}`, mechanicId);
            await redisClient.expire(`cell:${cellToken}`, cellEx);

            return true;
        } catch (error) {
            console.log("🛑 Error updating driver's location.", error);
            return false;
        } finally {
            const message = {
                payload: mechanic,
                eventType: QueueEvents.LOCATION_UPDATE,
            };
            await RabbitMQ.publishToExchange(QueueNames.LOCATION, QueueEvents.LOCATION_UPDATE, message);
        }
    }

    public async trackMechanic(mechanicId: string) {
        try {
            const mechanicData = await redisClient.get(`mechanic:${mechanicId}`);
            if (mechanicData) {
                return JSON.parse(mechanicData);
            }
            return {};
        } catch (error) {
            console.log(error);
            return {};
        }
    }

    public async findNearbyMechanics(
        lat: number,
        lng: number,
        radiusKm: number = 20,
        limit: number = 20
    ) {
        try {
            const latLng = new S2.LatLng(lat, lng);

            // Get covering cells for the radius
            const coveringOptions = {
                min: S2_LEVEL,
                max: S2_LEVEL,
                max_cells: 20 // Limit to 20 cells
            };

            const covering = S2.RegionCoverer.getRadiusCovering(
                latLng,
                radiusKm * 1000, // Convert km to meters
                coveringOptions
            );

            if (covering) {
                // Extract cell tokens
                const cellTokens = covering.cellIds().map(cellId => cellId.token());

                const mechanics = [];
                let count = 0;
                for (const cellToken of cellTokens) {
                    if (count >= limit) {
                        break; // Stop if we've reached the mechanic limit
                    }
                    const mechanicIds = await redisClient.smembers(`cell:${cellToken}`);
                    for (const mechanicId of mechanicIds) {
                        const mechanicData = await redisClient.get(`${this.coordinatesKey}:${mechanicId}`);
                        if (mechanicData) {
                            const mechanic = JSON.parse(mechanicData);
                            mechanics.push(mechanic);
                            count += 1;
                        }
                    }
                }

                // Sort by distance and limit to 10
                mechanics.sort((a, b) =>
                    Location.haversineDistance(lat, lng, a.latitude, a.longitude) -
                    Location.haversineDistance(lat, lng, b.latitude, b.longitude)
                );
                return mechanics;
            }
            return [];
        } catch (error) {
            console.error('Redis query failed:', error);
            logger.info("🚚 Falling back to mongodb for nearBy mechanics");
            return await this.findNearbyMechanicsMongodb(lat, lng, radiusKm, limit);
        }
    }

    public async findNearbyMechanicsMongodb(
        lat: number,
        lng: number,
        radiusKm: number = 20,
        limit: number = 20
    ) {
        const page = 1;
        const skip = (page - 1) * limit;

        try {
            return await MechanicLocationModel.find({
                location: {
                    $near: {
                        $geometry: {type: 'Point', coordinates: [lng, lat]},
                        $maxDistance: radiusKm * 1000, // Meters
                    },
                },
                timestamp: {$gt: Date.now() - 30 * 1000}, // Last 30 seconds
            })
                .limit(limit)
                .skip(skip)
                .lean();
        } catch (error) {
            this.handleMongoError(error);
            return [];
        }
    }

}