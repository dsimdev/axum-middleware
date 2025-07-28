export const formatResponse = (data) => {
    if (!data) {
        return null;
    }
    return {
        success: true,
        data: data,
        timestamp: new Date().toISOString(),
    };
};

export const handleError = (error) => {
    console.error(error);
    return {
        success: false,
        message: error.message || 'An unexpected error occurred.',
        timestamp: new Date().toISOString(),
    };
};