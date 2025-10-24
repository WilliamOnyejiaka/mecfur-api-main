import S2 from '@radarlabs/s2';
import {redisClient} from "./../config";
import MechanicLocationModel from "../models/LocationModel";

const S2_LEVEL = 13;

type MechanicLocation = {
    driverId: string,
    latitude: number,
    longitude: number,
    timestamp: Date,
};


export default class Location {

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
        const {driverId, latitude, longitude, timestamp} = location;

        // Convert lat/lng to S2 cell ID using @radarlabs/s2
        const latLng = new S2.LatLng(latitude, longitude);
        const cellId = new S2.CellId(latLng);
        const cellAtLevel = cellId.parent(S2_LEVEL);
        const cellToken = cellAtLevel.token();

        // Prepare driver data
        const driver = {
            driverId,
            latitude,
            longitude,
            s2CellId: cellToken,
            lastUpdated: timestamp
        };

        try {
            // Store in Redis (TTL of 30 seconds) and cell set
            await redisClient.setex(`driver:${driverId}`, 30, JSON.stringify(driver));
            await redisClient.sadd(`cell:${cellToken}`, driverId);
            await redisClient.expire(`cell:${cellToken}`, 15);

            return true;
        } catch (error) {
            console.log("🛑 Error updating driver's location.", error);
            return false;
        }
    }

    public async findNearbyDrivers(
        lat: number,
        lng: number,
        radiusKm: number = 5,
        s2Level: number = S2_LEVEL
    ) {
        try {
            const latLng = new S2.LatLng(lat, lng);

            // Get covering cells for the radius
            const coveringOptions = {
                min: s2Level,
                max: s2Level,
                max_cells: 20 // Limit to 20 cells
            };

            const covering = S2.RegionCoverer.getRadiusCovering(
                latLng,
                radiusKm * 1000, // Convert km to meters
                coveringOptions
            );

            // Extract cell tokens
            const cellTokens = covering!.cellIds().map(cellId => cellId.token());

            const drivers = [];
            for (const cellToken of cellTokens) {
                const driverIds = await redisClient.smembers(`cell:${cellToken}`);
                for (const driverId of driverIds) {
                    const driverData = await redisClient.get(`driver:${driverId}`);
                    if (driverData) {
                        const driver = JSON.parse(driverData);
                        drivers.push(driver);
                    }
                }
            }

            // Sort by distance and limit to 10
            drivers.sort((a, b) =>
                Location.haversineDistance(lat, lng, a.latitude, a.longitude) -
                Location.haversineDistance(lat, lng, b.latitude, b.longitude)
            );
            return drivers.slice(0, 10);
        } catch (error) {
            console.error('Redis query failed:', error);
            return [];
        }
    }

    public async findNearbyDriversMongodb(
        lat: number,
        lng: number,
        radiusKm: number = 5,
        s2Level: number = S2_LEVEL
    ) {
        const page = 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const users = await MechanicLocationModel.find({
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
    }

}