import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SendScreen() {
    const router = useRouter();
    const theme = Colors.dark;
    const [code, setCode] = useState('0000');

    useEffect(() => {
        // Generate random 4 digit code
        const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
        setCode(randomCode);
    }, []);

    const shareLink = () => {
        Share.share({
            message: `Join my CopyEasy room: ${code}`,
        });
    };

    const enterRoom = () => {
        // Navigate to room
        router.push(`/room/${code}`);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Tu Sala</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.qrContainer, { backgroundColor: 'white' }]}>
                    <QRCode value={code} size={200} />
                </View>

                <Text style={[styles.instruction, { color: theme.icon }]}>
                    Escanea o ingresa este código
                </Text>

                <TouchableOpacity onPress={shareLink} style={styles.codeDisplay}>
                    <Text style={[styles.codeText, { color: theme.primary }]}>{code}</Text>
                    <MaterialCommunityIcons name="content-copy" size={20} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={enterRoom}
                >
                    <Text style={styles.buttonText}>Entrar a la Sala</Text>
                    <MaterialCommunityIcons name="arrow-right" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        gap: 16,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#27272a',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    qrContainer: {
        padding: 20,
        borderRadius: 24,
        overflow: 'hidden',
    },
    instruction: {
        fontSize: 16,
        textAlign: 'center',
    },
    codeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(0, 229, 255, 0.1)',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 229, 255, 0.3)',
    },
    codeText: {
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: 4,
        fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    },
    footer: {
        marginTop: 'auto',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 8,
    },
    buttonText: {
        color: 'black',
        fontSize: 18,
        fontWeight: '700',
    }
});
