import { Button, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from './Themed';
import { Pie, PolarChart } from 'victory-native';
import createDatabase from '@/repository/CreateDatabase';
import { useEffect, useState } from 'react';
import { ExternalLink } from './ExternalLink';
import Colors from '@/constants/Colors';
import { MonoText } from './StyledText';
import { TransactionService } from '@/repository/TransactionService';
import { createAnimatedPropAdapter } from 'react-native-reanimated';
import { Avatar, Card, IconButton } from 'react-native-paper';
import { green } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
import CardContent from 'react-native-paper/lib/typescript/components/Card/CardContent';
import { Box } from '@shopify/react-native-skia';

export default function EditScreenInfo({ path }: { path: string }) {
    const [transactions, setTransactions] = useState<any>([]);
    const [createdTransaction, setCreatedTransaction] = useState<any>([]);

    function randomNumber() {
        return Math.floor(Math.random() * 26) + 45;
    }
    function generateRandomColor(): string {
        // Generating a random number between 0 and 0xFFFFFF
        const randomColor = Math.floor(Math.random() * 0xffffff);
        // Converting the number to a hexadecimal string and padding with zeros
        return `#${randomColor.toString(16).padStart(6, '0')}`;
    }

    async function getTransactions() {
        const data: any = await TransactionService.findAll();
        setTransactions(data);
    }
    async function createTransaction() {
        const createdTransaction: any = await TransactionService.create();
        setCreatedTransaction(createdTransaction);
    }
    return (
        <View style={{ height: 600 }}>
            <View style={styles.getStartedContainer}>
                <Button
                    title="Create transaction"
                    onPress={() => createTransaction()}></Button>
                <Button
                    title="Get transaction"
                    onPress={() => getTransactions()}></Button>
            </View>
            <ScrollView style={{ minHeight: 400 }}>
                {transactions?.map((t: any, index: number) => {
                    return (
                        <Card
                            mode="outlined"
                            style={{ borderColor: 'white', height: 80 }}
                            key={index}>
                            <Card.Title
                                titleStyle={{
                                    color: 'white',
                                    backgroundColor: 'green',
                                }}
                                subtitleStyle={{ color: 'white' }}
                                title={t.nameOfPlace}
                                subtitle={t.amount}
                                left={(props) => (
                                    <Avatar.Icon
                                        {...props}
                                        icon="currency-usd"
                                    />
                                )}
                                right={(props) => (
                                    <IconButton
                                        {...props}
                                        icon="dots-vertical"
                                        onPress={() => {}}
                                    />
                                )}
                            />
                        </Card>
                    );
                })}
            </ScrollView>
            <View style={{ height: 300 }}>
                <Card>
                    <Card.Title
                        titleStyle={{ color: 'white' }}
                        subtitleStyle={{ color: 'white' }}
                        title={transactions[0]?.nameOfPlace}
                        subtitle={transactions?.length}></Card.Title>
                    <Card.Content>
                        <Text style={{ color: 'white' }}>
                            {transactions[0]?.date}
                        </Text>
                        <Text style={{ color: 'white' }}>
                            {transactions[0]?.categoryId}
                        </Text>
                        <Text style={{ color: 'white' }}>
                            {transactions[0]?.color}
                        </Text>
                    </Card.Content>
                </Card>
            </View>

            {/* <View style={{ height: 300 }}>
                <PolarChart
                    data={transactions} // 👈 specify your data
                    labelKey={'label'}
                    valueKey={'value'} // 👈 specify data key for values
                    colorKey={'color'} // 👈 specify data key for color
                >
                    <Pie.Chart />
                </PolarChart>
            </View> */}
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
