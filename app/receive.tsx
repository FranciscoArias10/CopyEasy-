import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReceiveScreen() {
    const router = useRouter();
    const theme = Colors.dark;
    const [code, setCode] = useState('');

    const joinRoom = () => {
        let roomToJoin = code;
        if (roomToJoin.includes('/room/')) {
            const parts = roomToJoin.split('/room/');
            if (parts.length > 1) {
                roomToJoin = parts[1].replace(/\/$/, '');
            }
        }

        if (roomToJoin.length > 0) {
            router.push(`/room/${roomToJoin}`);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Unirse</Text>
                </View>

                <View style={styles.content}>
                    <Text style={[styles.label, { color: theme.icon }]}>Ingresa el código</Text>

                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
                        value={code}
                        onChangeText={setCode}
                        placeholder="0000"
                        placeholderTextColor="#555"
                        keyboardType="number-pad"
                        maxLength={4}
                        autoFocus
                    />

                    <View style={styles.divider}>
                        <View style={[styles.line, { backgroundColor: theme.border }]} />
                        <Text style={{ color: theme.icon }}>O</Text>
                        <View style={[styles.line, { backgroundColor: theme.border }]} />
                    </View>

                    <TouchableOpacity
                        style={[styles.scanButton, { borderColor: theme.primary }]}
                        onPress={() => router.push('/scan')}
                    >
                        <MaterialCommunityIcons name="qrcode-scan" size={24} color={theme.primary} />
                        <Text style={[styles.scanButtonText, { color: theme.primary }]}>Escanear QR</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: code.length > 0 ? theme.primary : theme.surface },
                            code.length === 0 && { opacity: 0.5 }
                        ]}
                        onPress={joinRoom}
                        disabled={code.length === 0}
                    >
                        <Text style={[styles.buttonText, { color: code.length > 0 ? 'black' : theme.icon }]}>
                            Conectar
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        justifyContent: 'center',
        gap: 24,
    },
    label: {
        fontSize: 16,
        textAlign: 'center',
    },
    input: {
        fontSize: 64,
        fontWeight: '800',
        textAlign: 'center',
        paddingVertical: 24,
        borderRadius: 24,
        borderWidth: 1,
        letterSpacing: 12,
        fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginVertical: 12,
    },
    line: {
        flex: 1,
        height: 1,
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        gap: 12,
    },
    scanButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 16,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
    }
});
