import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import migrations from '../drizzle/migrations.js';
import { useColorScheme } from '@/components/useColorScheme';
import { openDatabaseSync } from 'expo-sqlite';
import { View, Text } from 'react-native';
import { drizzle } from 'drizzle-orm/expo-sqlite/driver.js';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { PaperProvider } from 'react-native-paper';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const expoDb = openDatabaseSync('finanzzila.db');

const db = drizzle(expoDb);

const darkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: 'tomato',
        secondary: 'yellow',
    },
};
const ligthTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: 'tomato',
        secondary: 'yellow',
    },
};

export default function RootLayout() {
    const [loaded, errorFont] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
    });
    const { success, error } = useMigrations(db, migrations);

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (errorFont) throw errorFont;
    }, [errorFont]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    if (errorFont) {
        return (
            <View>
                <Text>Migration error: {error?.message}</Text>
            </View>
        );
    }

    if (!success) {
        return (
            <View>
                <Text>Migration is in progress...</Text>
            </View>
        );
    }

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <PaperProvider
                theme={colorScheme === 'dark' ? darkTheme : ligthTheme}>
                <Stack>
                    <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="modal"
                        options={{ presentation: 'modal' }}
                    />
                </Stack>
            </PaperProvider>
        </ThemeProvider>
    );
}
