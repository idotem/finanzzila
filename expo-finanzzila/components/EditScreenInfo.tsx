import { StyleSheet } from 'react-native';

import { Text, View } from './Themed';
import { Pie, PolarChart } from 'victory-native';
import createDatabase from '@/repository/CreateDatabase';
import { useEffect, useState } from 'react';

export default function EditScreenInfo({ path }: { path: string }) {
    const [transactions, setTransactions] = useState<any>([]);
    function randomNumber() {
        return Math.floor(Math.random() * 26) + 125;
    }
    function generateRandomColor(): string {
        // Generating a random number between 0 and 0xFFFFFF
        const randomColor = Math.floor(Math.random() * 0xffffff);
        // Converting the number to a hexadecimal string and padding with zeros
        return `#${randomColor.toString(16).padStart(6, '0')}`;
    }

    useEffect(() => {
        getTransactions();
        async function getTransactions() {
            const data: any = await createDatabase();
            if (!data) {
                console.log('DATA LOADDE');
                return;
            }
            const DATA: Record<string, unknown>[] = [
                {
                    value: data[0].value,
                    color: generateRandomColor(),
                    label: `${data[0].intValue}`,
                },
                {
                    value: data[1].value,
                    color: generateRandomColor(),
                    label: `${data[1].intValue}`,
                },
                {
                    value: data[2].value,
                    color: generateRandomColor(),
                    label: `${data[2].intValue}`,
                },
            ];
            setTransactions(DATA);
        }
    }, []);

    return (
        <View>
            <View style={styles.getStartedContainer}>
                <Text
                    style={styles.getStartedText}
                    lightColor="rgba(0,0,0,0.8)"
                    darkColor="rgba(255,255,255,0.8)">
                    I LOVE TAMSIII, MY BEAUTIFUL WIFEYYY !! `{'<3'}`
                </Text>
                <Text
                    style={styles.getStartedText}
                    lightColor="rgba(0,0,0,0.8)"
                    darkColor="rgba(255,255,255,0.8)"></Text>
            </View>

            <View style={{ height: 300 }}>
                <PolarChart
                    data={transactions} // 👈 specify your data
                    labelKey={'label'}
                    valueKey={'value'} // 👈 specify data key for values
                    colorKey={'color'} // 👈 specify data key for color
                >
                    <Pie.Chart />
                </PolarChart>
            </View>
            {/*
                    <View style={styles.helpContainer}>
                    <ExternalLink
                    style={styles.helpLink}
                    href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet">
                    <Text style={styles.helpLinkText} lightColor={Colors.light.tint}>
                    Tap here if your app doesn't automatically update after making changes
                    </Text>
                    </ExternalLink>
                    </View>
                    */}
        </View>
    );
}

const styles = StyleSheet.create({
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50,
    },
    homeScreenFilename: {
        marginVertical: 7,
    },
    codeHighlightContainer: {
        borderRadius: 3,
        paddingHorizontal: 4,
    },
    getStartedText: {
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'center',
    },
    helpContainer: {
        marginTop: 15,
        marginHorizontal: 20,
        alignItems: 'center',
    },
    helpLink: {
        paddingVertical: 15,
    },
    helpLinkText: {
        textAlign: 'center',
    },
});
