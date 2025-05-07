const API_URL = 'https://employeeschedulerapi.azurewebsites.net/api';

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        // Store the token in localStorage
        localStorage.setItem('token', data.token);
        return data;
    } catch (error) {
        throw error;
    }
}; 