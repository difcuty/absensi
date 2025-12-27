// services/absensiService.js
const API_URL = import.meta.env.VITE_API_URL;

export const submitAbsensi = async (absensiData) => {
    try {
        const response = await fetch(`${API_URL}/api/absensi/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(absensiData)
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Service Error (submitAbsensi):", error);
        throw error;
    }
};