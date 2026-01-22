import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanScreen() {
    const router = useRouter();
    const theme = Colors.dark;
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    if (!permission) {
        // Camera permissions are still loading.
        return <View style={{ flex: 1, backgroundColor: theme.background }} />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.content}>
                    <MaterialCommunityIcons name="camera-off" size={64} color={theme.icon} />
                    <Text style={[styles.message, { color: theme.text }]}>Necesitamos permiso para usar la cámara</Text>
                    <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={requestPermission}>
                        <Text style={styles.buttonText}>Dar permiso</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                        <Text style={{ color: theme.icon }}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);

        let roomCode = data;
        // Parse URL if present (e.g., https://domain.com/room/1234)
        if (data.includes('/room/')) {
            const parts = data.split('/room/');
            if (parts.length > 1) {
                roomCode = parts[1].replace(/\/$/, ''); // Remove trailing slash if any
            }
        }

        router.replace(`/room/${roomCode}`);
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />

            <SafeAreaView style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Escanear QR</Text>
                </View>

                <View style={styles.scanTarget}>
                    <View style={styles.cornerTL} />
                    <View style={styles.cornerTR} />
                    <View style={styles.cornerBL} />
                    <View style={styles.cornerBR} />
                </View>

                <Text style={styles.instruction}>Apunta al código QR del otro dispositivo</Text>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 24
    },
    message: {
        textAlign: 'center',
        fontSize: 18,
    },
    button: {
        padding: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    scanTarget: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    instruction: {
        color: 'white',
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 40,
    },
    // Corners for visual effect
    cornerTL: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#00E5FF' },
    cornerTR: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#00E5FF' },
    cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#00E5FF' },
    cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#00E5FF' },
});
