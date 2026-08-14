import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Root entry point.
 *
 * Checks whether a valid auth token is stored locally:
 *   - Token found  → redirect straight to the appropriate dashboard (no login flash)
 *   - No token     → redirect to /login (first launch or after logout)
 *
 * This mirrors the pattern used by apps like AliExpress / Daraz where the
 * home/dashboard is shown to returning users without forcing them to log in again.
 */
export default function Index() {
    const router = useRouter();

    useEffect(() => {
        async function resolveInitialRoute() {
            try {
                const results = await AsyncStorage.multiGet(['token', 'user']);
                const token = results[0][1];
                const userRaw = results[1][1];

                const hasToken = token !== null && token !== '';
                const user = userRaw ? JSON.parse(userRaw) : null;

                if (hasToken && user) {
                    // Already logged in — go straight to the right dashboard
                    if (user.role === 'admin') {
                        router.replace('/admin/dashboard');
                    } else {
                        router.replace('/user/dashboard');
                    }
                } else {
                    // First launch or after logout — show login
                    router.replace('/login');
                }
            } catch {
                // Storage error fallback
                router.replace('/login');
            }
        }

        resolveInitialRoute();
    }, []);

    // Brief dark splash while we read storage
    return (
        <View style={styles.splash}>
            <ActivityIndicator size="large" color="#3D8064" />
        </View>
    );
}

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#102A25'
    }
});