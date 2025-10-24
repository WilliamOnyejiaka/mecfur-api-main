

export default function calculateProfileCompletion(user: any): number {
    // Basic completion percentage calculation based on non-empty fields
    const fields = [
        user.firstName,
        user.lastName,
        user.email,
        user.phone,
        user.dateOfBirth,
        user.gender,
        user.height,
        user.address,
        user.city,
        user.state,
        user.country,
        user.zipCode,
        user.nativeLanguage,
        user.spokenLanguages?.length > 0,
        user.hobbies?.length > 0,
        user.interests?.length > 0,
        user.favoriteColors?.length > 0,
        user.pets?.length > 0,
        user.education,
        user.religion,
        user.whatBringsYouHere,
        user.genderInterest,
        user.lookingFor?.length > 0,
        user.minAge,
        user.maxAge,
        user.photo?.url,
    ];
    const filledFields = fields.filter(field => field && field !== "").length;
    return Math.round((filledFields / fields.length) * 100);
}


function s(user: any) {
    // Define fields to check for completion
    const fields = [
        { name: 'firstName', required: true, weight: 10 },
        { name: 'lastName', required: true, weight: 10 },
        { name: 'password', required: true, weight: 10 }, // Required but typically not counted for profile completion
        { name: 'email', required: true, weight: 10 },
        { name: 'location.coordinates', required: true, weight: 10 },
        { name: 'phone', required: false, weight: 5 },
        { name: 'dateOfBirth', required: false, weight: 5 },
        { name: 'gender', required: false, weight: 5 },
        { name: 'minAge', required: false, weight: 5 },
        { name: 'maxAge', required: false, weight: 5 },
        { name: 'whatBringsYouHere', required: false, weight: 5 },
        { name: 'education', required: false, weight: 5 },
        { name: 'religion', required: false, weight: 5 },
        { name: 'genderInterest', required: false, weight: 5 },
        { name: 'lookingFor', required: false, weight: 5 },
        { name: 'photo.url', required: false, weight: 5 }
    ];

    let totalWeight = 0;
    let completedWeight = 0;

    // Calculate total possible weight
    fields.forEach(field => {
        totalWeight += field.weight;
    });

    // Check each field for completion
    fields.forEach(field => {
        // Handle nested fields (e.g., location.coordinates, photo.url)
        if (field.name.includes('.')) {
            const [parent, child] = field.name.split('.');
            if (user[parent] && user[parent][child] && user[parent][child] !== '') {
                completedWeight += field.weight;
            }
        } else {
            // Handle non-nested fields
            if (user[field.name] && user[field.name] !== '' && user[field.name] !== false) {
                completedWeight += field.weight;
            }
        }
    });

    // Calculate completion percentage
    const completionPercentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

    return {
        percentage: completionPercentage,
        completedFields: completedWeight,
        totalFields: totalWeight,
        missingFields: fields
            .filter(field => {
                if (field.name.includes('.')) {
                    const [parent, child] = field.name.split('.');
                    return !user[parent] || !user[parent][child] || user[parent][child] === '';
                }
                return !user[field.name] || user[field.name] === '' || user[field.name] === false;
            })
            .map(field => field.name)
    };
}