import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Root layout — full edge-to-edge display.
 *
 * No SafeAreaView here so each screen can use the entire display,
 * exactly like AliExpress / Daraz. Screens that need safe-area
 * padding (e.g. login) manage it themselves with SafeAreaView.
 */
export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <StatusBar style="light" backgroundColor="#102A25" translucent={false} />

            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: styles.screen,
                    // Smooth slide transition between routes
                    animation: 'slide_from_right',
                }}
            />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#102A25',
    },
});
