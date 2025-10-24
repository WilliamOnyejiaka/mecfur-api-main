import S2 from '@radarlabs/s2';
import redisClient from './../config/redis';

// S2 cell level for ~1.27 km² precision
const S2_LEVEL = 13;


type DriverLocation = {
    driverId: string,
    latitude: number,
    longitude: number,
    timestamp: any,
    name: string
};

// Store driver location in Redis and MongoDB
export async function updateDriverLocation(location: DriverLocation): Promise<void> {
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

    // Store in Redis (TTL of 30 seconds) and cell set
    await redisClient.setex(`driver:${driverId}`, 30, JSON.stringify(driver));
    await redisClient.sadd(`cell:${cellToken}`, driverId);
    await redisClient.expire(`cell:${cellToken}`, 15);
}

// Find nearby drivers within a radius, limiting to 20 S2 cells
export async function findNearbyDrivers(
    lat: number,
    lng: number,
    radiusKm: number = 5,
    s2Level: number = S2_LEVEL,
    useMongoFallback: boolean = false,
    useMongoGeoQuery: boolean = false // Option to use MongoDB's native geospatial query
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
                    // Filter by radius
                    // if (haversineDistance(lat, lng, driver.latitude, driver.longitude) <= radiusKm) {
                        drivers.push(driver);
                    // }
                }
            }
        }

        // Sort by distance and limit to 10
        drivers.sort((a, b) =>
            haversineDistance(lat, lng, a.latitude, a.longitude) -
            haversineDistance(lat, lng, b.latitude, b.longitude)
        );
        return drivers.slice(0, 10);
    } catch (error) {
        console.error('Redis query failed:', error);
        return [];
    }
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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


// ============================================
// TEST SCENARIO 1: Drivers around Port Harcourt City Center
// ============================================

// Center point: Port Harcourt City (near Pleasure Park)
export const PORT_HARCOURT_CENTER = {
    lat: 4.8156,
    lng: 7.0498,
    name: 'Port Harcourt City Center'
};

// Drivers distributed around the city center (within ~5km radius)
export const driversNearCenter: DriverLocation[] = [
    {
        driverId: 'driver-001',
        latitude: 4.8156,
        longitude: 7.0498,
        timestamp: Date.now(),
        name: 'At Pleasure Park'
    },
    {
        driverId: 'driver-002',
        latitude: 4.8201,
        longitude: 7.0534,
        timestamp: Date.now(),
        name: 'Near Trans Amadi'
    },
    {
        driverId: 'driver-003',
        latitude: 4.8089,
        longitude: 7.0421,
        timestamp: Date.now(),
        name: 'Near Port Harcourt Mall'
    },
    {
        driverId: 'driver-004',
        latitude: 4.8234,
        longitude: 7.0389,
        timestamp: Date.now(),
        name: 'Near Garrison'
    },
    {
        driverId: 'driver-005',
        latitude: 4.8098,
        longitude: 7.0612,
        timestamp: Date.now(),
        name: 'Near Rumuola'
    },
    {
        driverId: 'driver-006',
        latitude: 4.8312,
        longitude: 7.0523,
        timestamp: Date.now(),
        name: 'Near D-Line'
    },
    {
        driverId: 'driver-007',
        latitude: 4.8045,
        longitude: 7.0489,
        timestamp: Date.now(),
        name: 'Near Agip'
    },
    {
        driverId: 'driver-008',
        latitude: 4.8189,
        longitude: 7.0298,
        timestamp: Date.now(),
        name: 'Near Elekahia'
    }
];

// ============================================
// TEST SCENARIO 2: Airport Area
// ============================================

export const PORT_HARCOURT_AIRPORT = {
    lat: 5.0155,
    lng: 6.9496,
    name: 'Port Harcourt International Airport'
};

export const driversNearAirport: DriverLocation[] = [
    {
        driverId: 'driver-101',
        latitude: 5.0155,
        longitude: 6.9496,
        timestamp: Date.now(),
        name: 'At Airport'
    },
    {
        driverId: 'driver-102',
        latitude: 5.0178,
        longitude: 6.9512,
        timestamp: Date.now(),
        name: 'Near Airport Exit'
    },
    {
        driverId: 'driver-103',
        latitude: 5.0134,
        longitude: 6.9467,
        timestamp: Date.now(),
        name: 'Airport Parking'
    }
];

// ============================================
// TEST SCENARIO 3: Major City Landmarks
// ============================================

export const majorLandmarks = {
    universityOfPortHarcourt: {
        lat: 4.8983,
        lng: 6.9144,
        name: 'University of Port Harcourt'
    },
    riversStateSec: {
        lat: 4.8245,
        lng: 7.0336,
        name: 'Rivers State Secretariat'
    },
    gardenCity: {
        lat: 4.8401,
        lng: 7.0134,
        name: 'Garden City Shopping Mall'
    },
    bonnyBridgeArea: {
        lat: 4.8123,
        lng: 7.0789,
        name: 'Near Bonny Bridge'
    }
};

export const driversAtLandmarks: DriverLocation[] = [
    {
        driverId: 'driver-201',
        latitude: 4.8983,
        longitude: 6.9144,
        timestamp: Date.now(),
        name: 'At UNIPORT'
    },
    {
        driverId: 'driver-202',
        latitude: 4.8245,
        longitude: 7.0336,
        timestamp: Date.now(),
        name: 'At State Secretariat'
    },
    {
        driverId: 'driver-203',
        latitude: 4.8401,
        longitude: 7.0134,
        timestamp: Date.now(),
        name: 'At Garden City Mall'
    },
    {
        driverId: 'driver-204',
        latitude: 4.8123,
        longitude: 7.0789,
        timestamp: Date.now(),
        name: 'Near Bonny Bridge'
    }
];

// ============================================
// TEST SCENARIO 4: Edge Cases
// ============================================

// Very close drivers (testing precision)
export const veryCloseDrivers: DriverLocation[] = [
    {
        driverId: 'driver-301',
        latitude: 4.8156,
        longitude: 7.0498,
        timestamp: Date.now(),
        name: 'Position A'
    },
    {
        driverId: 'driver-302',
        latitude: 4.8157, // ~111 meters away
        longitude: 7.0498,
        timestamp: Date.now(),
        name: 'Position B'
    },
    {
        driverId: 'driver-303',
        latitude: 4.8156,
        longitude: 7.0499, // ~96 meters away
        timestamp: Date.now(),
        name: 'Position C'
    }
];

// Drivers with old timestamps (for TTL testing)
export const driversWithOldTimestamps: DriverLocation[] = [
    {
        driverId: 'driver-401',
        latitude: 4.8156,
        longitude: 7.0498,
        timestamp: Date.now() - 5 * 1000, // 5 seconds ago
        name: 'Recent driver'
    },
    {
        driverId: 'driver-402',
        latitude: 4.8167,
        longitude: 7.0512,
        timestamp: Date.now() - 25 * 1000, // 25 seconds ago (should still be valid)
        name: 'Almost expired'
    },
    {
        driverId: 'driver-403',
        latitude: 4.8178,
        longitude: 7.0523,
        timestamp: Date.now() - 45 * 1000, // 45 seconds ago (expired)
        name: 'Expired driver'
    }
];

// ============================================
// TEST SCENARIO 5: Wide Distribution
// ============================================

// Drivers spread across wider Port Harcourt area (~20km radius)
export const wideDistributionDrivers: DriverLocation[] = [
    {
        driverId: 'driver-501',
        latitude: 4.7523,
        longitude: 7.0123,
        timestamp: Date.now(),
        name: 'Choba Area'
    },
    {
        driverId: 'driver-502',
        latitude: 4.8678,
        longitude: 6.9876,
        timestamp: Date.now(),
        name: 'Rumuokoro'
    },
    {
        driverId: 'driver-503',
        latitude: 4.8934,
        longitude: 7.0945,
        timestamp: Date.now(),
        name: 'Eliozu'
    },
    {
        driverId: 'driver-504',
        latitude: 4.7812,
        longitude: 7.0834,
        timestamp: Date.now(),
        name: 'Abuloma'
    }
];

// ============================================
// UTILITY: Test Query Points
// ============================================

export const testQueryPoints = [
    {
        name: 'City Center Search',
        lat: 4.8156,
        lng: 7.0498,
        radiusKm: 5,
        expectedDriversNearby: 8
    },
    {
        name: 'Airport Search',
        lat: 5.0155,
        lng: 6.9496,
        radiusKm: 3,
        expectedDriversNearby: 3
    },
    {
        name: 'University Area Search',
        lat: 4.8983,
        lng: 6.9144,
        radiusKm: 2,
        expectedDriversNearby: 1
    },
    {
        name: 'Narrow Search (1km)',
        lat: 4.8156,
        lng: 7.0498,
        radiusKm: 1,
        expectedDriversNearby: 3
    },
    {
        name: 'Wide Search (20km)',
        lat: 4.8156,
        lng: 7.0498,
        radiusKm: 20,
        expectedDriversNearby: 12
    }
];

// ============================================
// SAMPLE TEST EXECUTION
// ============================================

export async function runSampleTests(
    lat: any, lon: any
    // updateDriverLocation: (location: DriverLocation) => Promise<void>,
    // findNearbyDrivers: (lat: number, lng: number, radiusKm?: number) => Promise<any[]>
) {
    console.log('🚀 Starting driver location tests...\n');

    // Test 1: Update driver locations around city center
    console.log('📍 Test 1: Updating driver locations...');
    for (const driver of driversNearCenter) {
        await updateDriverLocation(driver);
    }
    console.log(`✅ Added ${driversNearCenter.length} drivers\n`);

    // Test 2: Search for nearby drivers
    console.log('🔍 Test 2: Finding nearby drivers (5km radius)...');
    const nearby = await findNearbyDrivers(
        lat,
        lon,
        0.5
    );
    console.log(`✅ Found ${nearby.length} drivers`);
    console.log('Drivers:', nearby.map(d => d.driverId).join(', '));
    console.log('');

    // Test 3: Narrow search (1km)
    console.log('🔍 Test 3: Narrow search (1km radius)...');
    const nearbyNarrow = await findNearbyDrivers(
        PORT_HARCOURT_CENTER.lat,
        PORT_HARCOURT_CENTER.lng,
        1
    );
    console.log(`✅ Found ${nearbyNarrow.length} drivers within 1km`);
    console.log('');

    // Test 4: Airport area search
    console.log('✈️ Test 4: Airport area search...');
    for (const driver of driversNearAirport) {
        await updateDriverLocation(driver);
    }
    const airportDrivers = await findNearbyDrivers(
        PORT_HARCOURT_AIRPORT.lat,
        PORT_HARCOURT_AIRPORT.lng,
        3
    );
    console.log(`✅ Found ${airportDrivers.length} drivers near airport`);
    console.log('');

    console.log('✨ All tests completed!');
}

// ============================================
// COORDINATES REFERENCE
// ============================================

export const PORT_HARCOURT_REFERENCE = {
    cityBounds: {
        north: 4.90,
        south: 4.75,
        east: 7.10,
        west: 6.95
    },
    approximateArea: '350 km²',
    notes: [
        'Level 13 S2 cells are ~1.27 km²',
        'Level 14 S2 cells are ~0.32 km²',
        'Port Harcourt spans roughly 20km north-south',
        '30 second TTL tests real-time driver availability'
    ]
};