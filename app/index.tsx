import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const router = useRouter();
    const theme = Colors.dark; // Force dark theme for now

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="lightning-bolt" size={32} color={theme.primary} />
                <Text style={[styles.title, { color: theme.text }]}>CopyEasy</Text>
            </View>

            <Text style={[styles.subtitle, { color: theme.icon }]}>
                Transferencia ultrarrápida entre dispositivos.
            </Text>

            <View style={styles.actionsContainer}>
                {/* ENVIAR */}
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => router.push('/send')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(0, 229, 255, 0.1)' }]}>
                        <MaterialCommunityIcons name="upload" size={32} color={theme.primary} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Enviar</Text>
                        <Text style={[styles.cardDescription, { color: theme.icon }]}>
                            Crear una sala y generar código
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.icon} />
                </TouchableOpacity>

                {/* RECIBIR */}
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => router.push('/receive')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
                        <MaterialCommunityIcons name="download" size={32} color={theme.secondary} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Recibir</Text>
                        <Text style={[styles.cardDescription, { color: theme.icon }]}>
                            Escanear QR o ingresar código
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.icon} />
                </TouchableOpacity>

                {/* DOWNLOAD APP (WEB ONLY) */}
                {Platform.OS === 'web' && (
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 24 }]}
                        onPress={() => Linking.openURL('https://docs.google.com/uc?export=download&id=1hYbBYquX21NQDRi4jTaicaxPlj87OMEi')} // Google Drive Direct Link
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(50, 255, 100, 0.1)' }]}>
                            <MaterialCommunityIcons name="android" size={32} color="#10b981" />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>Descargar App</Text>
                            <Text style={[styles.cardDescription, { color: theme.icon }]}>
                                Instala el APK para Android (Mejor experiencia)
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="download-circle-outline" size={24} color={theme.icon} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.icon }]}>
                    No requiere registro • Cifrado E2E Simple
                </Text>
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
        marginBottom: 8,
        gap: 8,
        marginTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 48,
        lineHeight: 24,
    },
    actionsContainer: {
        gap: 16,
        flex: 1,
        justifyContent: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        gap: 16,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
    },
    footer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    footerText: {
        fontSize: 12,
        opacity: 0.6,
    },
});
