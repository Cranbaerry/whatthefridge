
import { apiConfig } from '../apiConfig';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
    const getSession = async () => {        
        const token = cookies.get('sb-auth-token');
        if (token) {
            const response = await fetch(apiConfig.auth.session, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Concern: JSON.parse() isn't enough because form actions - like load functions - also support returning Date or BigInt objects.
            const result = await response.json();
            if (result.type === 'success') {
                return result.data;
            } else {
                cookies.delete('sb-auth-token');
            }
        }

        return [null, null];
    };

    const { token, user } = await getSession();
    const session: App.Session = { user: user , token: token };
    return { session };
}


