
import { Colors } from '@/constants/theme';
import { supabase } from '@/utils/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = {
    id: string;
    type: 'text' | 'image' | 'link' | 'file';
    content: string;
    timestamp: number;
    sender: 'me' | 'other';
};

// SAFETY LIMITS
const MAX_TEXT_LENGTH = 30000; // ~30k chars (lots of text)
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit for Base64 string
const MESSAGE_TTL_HOURS = 24;

export default function RoomScreen() {
    const { id } = useLocalSearchParams();
    const roomCode = Array.isArray(id) ? id[0] : id;
    const router = useRouter();
    const theme = Colors.dark;
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [userCount, setUserCount] = useState(1);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Toast Helper
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2000);
    };

    // Smart Sorting for Web Board Layout
    const sortedMessages = useMemo(() => {
        if (Platform.OS !== 'web') return messages;

        const smallItems: Message[] = [];
        const largeItems: Message[] = [];

        messages.forEach(m => {
            // Text shorter than 80 chars goes to top "Notes" section
            if (m.type === 'text' && m.content.length < 80) {
                smallItems.push(m);
            } else {
                largeItems.push(m);
            }
        });

        return [...smallItems, ...largeItems];
    }, [messages]);

    useEffect(() => {
        if (!roomCode) return;

        // Fetch initial messages (Newest first)
        // Fetch initial messages (Newest first)
        const fetchMessages = async () => {
            // Cutoff time: 24 hours ago
            const cutoff = new Date(Date.now() - MESSAGE_TTL_HOURS * 60 * 60 * 1000).toISOString();

            // Background Cleanup: Delete old messages
            supabase.from('messages')
                .delete()
                .eq('room_code', roomCode)
                .lt('created_at', cutoff)
                .then(({ error }) => {
                    if (error) console.log('Cleanup error:', error);
                });

            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('room_code', roomCode)
                .gt('created_at', cutoff) // Only show messages from last 24h
                .order('created_at', { ascending: false }) // Newest on top
                .limit(50);

            if (data) {
                const mapped = data.map(m => ({
                    id: m.id.toString(),
                    type: m.type as 'text' | 'image' | 'link' | 'file',
                    content: m.content,
                    timestamp: new Date(m.created_at).getTime(),
                }));
                setMessages(mapped);
            }
        };

        fetchMessages();

        const channel = supabase
            .channel(`room:${roomCode}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_code=eq.${roomCode}`
                },
                (payload) => {
                    const m = payload.new;
                    const newMessage: Message = {
                        id: m.id.toString(),
                        type: m.type,
                        content: m.content,
                        timestamp: new Date(m.created_at).getTime(),
                        sender: 'other' as 'me' | 'other',
                    };
                    // Add new message to the START of the array (Top)
                    setMessages((prev) => [newMessage, ...prev]);
                }
            )
            .on('broadcast', { event: 'room_destroy' }, () => {
                showToast('⛔ La sala ha sido eliminada por el anfitrión.');
                setTimeout(() => {
                    router.replace('/');
                }, 2000);
            })
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const count = Object.keys(state).length;
                setUserCount(count);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track presence with a random ID
                    const presenceId = Math.random().toString(36).substring(7);
                    await channel.track({ online_at: new Date().toISOString(), id: presenceId });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomCode]);

    const sendMessage = async (msgContent: string = inputText, msgType: 'text' | 'image' | 'link' | 'file' = 'text') => {
        if (!msgContent?.trim()) return;

        let finalType = msgType;
        // Detect Link
        const urlRegex = /^(https?:\/\/[^\s]+)$/i;
        if (msgType === 'text' && urlRegex.test(msgContent.trim())) {
            finalType = 'link';
        }

        if (msgType === 'text') {
            setInputText('');
        }

        const { error } = await supabase.from('messages').insert({
            room_code: roomCode,
            content: msgContent.trim(),
            type: finalType,
        });

        if (error) {
            alert('Error enviando mensaje');
        }
    };

    // ... (rest of methods)



    const handlePaste = async () => {
        const text = await Clipboard.getStringAsync();
        if (text) {
            setInputText(text);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.2,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;

            // Check size limit (Base64 length is approx bytes)
            if (base64Img.length > MAX_IMAGE_SIZE_BYTES) {
                showToast('⚠️ Imagen demasiado grande (>5MB)');
                return;
            }

            sendMessage(base64Img, 'image');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];

            if (file.size && file.size > MAX_IMAGE_SIZE_BYTES) {
                showToast('⚠️ Archivo muy grande (>5MB)');
                return;
            }

            let base64Data = '';

            if (Platform.OS === 'web') {
                // Web: Fetch blob and convert
                const response = await fetch(file.uri);
                const blob = await response.blob();

                const reader = new FileReader();
                reader.onload = () => {
                    const res = reader.result as string;
                    // Prepare JSON content: { name: "foo.pdf", data: "data:application/pdf;base64,..." }
                    const content = JSON.stringify({
                        name: file.name,
                        size: file.size,
                        data: res
                    });

                    if (content.length > MAX_IMAGE_SIZE_BYTES) {
                        showToast('⚠️ Archivo demasiado grande');
                        return;
                    }

                    sendMessage(content, 'file');
                };
                reader.readAsDataURL(blob);

            } else {
                // Native: Read from URI
                base64Data = await FileSystem.readAsStringAsync(file.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                // Determine MIME loosely or just use generic data uri prefix
                const mime = file.mimeType || 'application/octet-stream';
                const dataUri = `data:${mime};base64,${base64Data}`;

                const content = JSON.stringify({
                    name: file.name,
                    size: file.size,
                    data: dataUri
                });

                if (content.length > MAX_IMAGE_SIZE_BYTES) {
                    showToast('⚠️ Archivo demasiado grande');
                    return;
                }

                sendMessage(content, 'file');
            }

        } catch (err) {
            console.log(err);
            showToast('Error al seleccionar archivo');
        }
    };

    const handleKeyPress = (e: any) => {
        if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const downloadItem = async (item: Message) => {
        if (Platform.OS === 'web') {
            // Web Download
            if (item.type === 'image' && item.content.startsWith('data:')) {
                const link = document.createElement("a");
                link.href = item.content;
                link.download = `copyeasy_${item.timestamp}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (item.type === 'text') {
                // Copy text
                await Clipboard.setStringAsync(item.content);
                showToast('¡Copiado!');
            } else if (item.type === 'file') {
                try {
                    const fileData = JSON.parse(item.content);
                    const link = document.createElement("a");
                    link.href = fileData.data;
                    link.download = fileData.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (e) {
                    console.log(e);
                    showToast('Error descargando archivo');
                }
            } else {
                window.open(item.content, '_blank');
            }
        } else {
            // Mobile Logic
            if (item.type === 'text') {
                await Clipboard.setStringAsync(item.content);
                showToast('¡Copiado!');
            } else if (item.type === 'image') {
                try {
                    const filename = FileSystem.documentDirectory + `image_${item.timestamp}.jpg`;
                    let base64Data = item.content;
                    if (item.content.startsWith('data:image')) {
                        base64Data = item.content.split(',')[1];
                    }

                    await FileSystem.writeAsStringAsync(filename, base64Data, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(filename);
                    } else {
                        showToast('Compartir no disponible');
                    }
                } catch (e) {
                    showToast('Error guardando imagen');
                }
            } else if (item.type === 'link') {
                // Open Link
                const canOpen = await Linking.canOpenURL(item.content);
                if (canOpen) {
                    await Linking.openURL(item.content);
                } else {
                    showToast('No se puede abrir el enlace');
                }
            } else if (item.type === 'file') {
                try {
                    const fileData = JSON.parse(item.content);
                    // Native File Save
                    const filename = FileSystem.documentDirectory + fileData.name;
                    const base64 = fileData.data.split(',')[1];

                    await FileSystem.writeAsStringAsync(filename, base64, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(filename);
                    } else {
                        showToast('Guardado en documentos');
                    }
                } catch (e) {
                    showToast('Error al descargar archivo');
                }
            }
        }
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isLink = item.type === 'link';
        return (
            <View style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
                Platform.OS === 'web' && { width: '32%' } // Fixed width to prevent single item stretching
            ]}>
                {/* Header: TypeIcon + Timestamp */}
                <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialCommunityIcons
                            name={item.type === 'image' ? 'image' : isLink ? 'link' : 'text-box'}
                            size={16}
                            color={theme.primary}
                        />
                        <Text style={{ color: theme.icon, fontSize: 12 }}>
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => downloadItem(item)}
                        style={[styles.actionButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                    >
                        <MaterialCommunityIcons
                            name={item.type === 'text' ? 'content-copy' : isLink ? 'open-in-new' : 'download'}
                            size={18}
                            color={theme.text}
                        />
                        <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>
                            {item.type === 'text' ? 'Copiar' : isLink ? 'Abrir' : 'Guardar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                    {item.type === 'text' && (
                        <Text style={{ color: theme.text, fontSize: 16, lineHeight: 24 }}>
                            {item.content}
                        </Text>
                    )}
                    {item.type === 'image' && (
                        <Image
                            source={{ uri: item.content }}
                            style={{ width: '100%', height: 250, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.2)' }}
                            contentFit="contain"
                        />
                    )}

                    {item.type === 'file' && (() => {
                        let fileName = 'Documento';
                        let size = '';
                        try {
                            const parsed = JSON.parse(item.content);
                            fileName = parsed.name;
                            size = parsed.size ? `(${(parsed.size / 1024).toFixed(0)} KB)` : '';
                        } catch (e) { }

                        return (
                            <TouchableOpacity onPress={() => downloadItem(item)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                                <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}>
                                    <MaterialCommunityIcons name="file-document-outline" size={24} color={theme.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.text, fontWeight: 'bold' }} numberOfLines={1}>{fileName}</Text>
                                    <Text style={{ color: theme.icon, fontSize: 12 }}>Documento {size}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })()}
                    {item.type === 'link' && (
                        <TouchableOpacity onPress={() => downloadItem(item)}>
                            <Text style={{ color: theme.secondary, fontSize: 16, lineHeight: 24, textDecorationLine: 'underline' }}>
                                {item.content}
                            </Text>
                            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <MaterialCommunityIcons name="web" size={14} color={theme.icon} />
                                <Text style={{ color: theme.icon, fontSize: 12 }}>Toque para visitar</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const deleteRoom = () => {
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        setDeleteModalVisible(false);
        await performDelete();
    };

    const performDelete = async () => {
        // 1. Notify everyone
        await supabase.channel(`room:${roomCode}`).send({
            type: 'broadcast',
            event: 'room_destroy',
        });

        // 2. Delete data
        const { error } = await supabase.from('messages').delete().eq('room_code', roomCode);

        if (error) {
            showToast('Error: ' + error.message);
        } else {
            router.replace('/');
        }
    };

    const handleExit = async () => {
        // If I am the last one (or count is 0/1), delete the room
        if (userCount <= 1) {
            showToast('🗑️ Sala vacía. Eliminando...');
            await performDelete(); // This checks out and redirects
        } else {
            router.back();
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleExit} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Archivos / Notas</Text>
                        <Text style={{ color: theme.success, fontSize: 12, textAlign: 'center' }}>Sala {roomCode}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity onPress={() => setQrModalVisible(true)} style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                            <MaterialCommunityIcons name="qrcode" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={deleteRoom} style={[styles.backButton, { backgroundColor: 'rgba(255,50,50,0.1)' }]}>
                            <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ff4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* List - Responsive Grid for Web */}
                <FlatList
                    data={sortedMessages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    numColumns={Platform.OS === 'web' ? 3 : 1}
                    key={Platform.OS === 'web' ? 'grid' : 'list'}
                    columnWrapperStyle={Platform.OS === 'web' ? { gap: 16, alignItems: 'flex-start' } : undefined}
                    contentContainerStyle={{ padding: 16, gap: 16 }}
                    inverted={Platform.OS !== 'web'}
                />

                {/* Input Toolbar */}
                <View style={[
                    styles.inputContainer,
                    { backgroundColor: theme.surface, borderTopColor: theme.border },
                    Platform.OS === 'web' && {
                        paddingHorizontal: '20%',
                        alignSelf: 'center',
                        width: '100%',
                        borderTopWidth: 0,
                        backgroundColor: 'transparent'
                    }
                ]}
                >
                    <View style={[
                        { flexDirection: 'row', alignItems: 'flex-end', gap: 12, flex: 1 },
                        Platform.OS === 'web' && {
                            backgroundColor: theme.surface,
                            borderRadius: 16,
                            padding: 8,
                            borderWidth: 1,
                            borderColor: theme.border
                        }
                    ]}>
                        <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
                            <MaterialCommunityIcons name="image" size={28} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={pickDocument} style={styles.attachButton}>
                            <MaterialCommunityIcons name="file-document" size={28} color={theme.secondary} />
                        </TouchableOpacity>

                        <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Escribe una nota..."
                            placeholderTextColor={theme.icon}
                            multiline
                            maxLength={MAX_TEXT_LENGTH}
                            onKeyPress={handleKeyPress}
                        />

                        {inputText.length === 0 ? (
                            <TouchableOpacity onPress={handlePaste} style={styles.utilButton}>
                                <MaterialCommunityIcons name="clipboard-arrow-down" size={24} color={theme.secondary} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => sendMessage()} style={styles.utilButton}>
                                <MaterialCommunityIcons name="arrow-up-circle" size={32} color={theme.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
            {/* Custom Delete Modal Overlay (Manual Implementation) */}
            {deleteModalVisible && (
                <View style={[styles.modalOverlay, StyleSheet.absoluteFill, { zIndex: 999 }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ff4444" />
                        <Text style={[styles.modalTitle, { color: theme.text }]}>¿Destruir Sala?</Text>
                        <Text style={[styles.modalText, { color: theme.icon }]}>
                            Se eliminará todo el contenido permanentemente. Esta acción no se puede deshacer.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={() => setDeleteModalVisible(false)}
                                style={[styles.modalButton, { backgroundColor: theme.background }]}
                            >
                                <Text style={{ color: theme.text }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmDelete}
                                style={[styles.modalButton, { backgroundColor: '#ff4444' }]}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Destruir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* QR Modal */}
            {qrModalVisible && (
                <View style={[styles.modalOverlay, StyleSheet.absoluteFill, { zIndex: 999 }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.modalTitle, { color: theme.text, marginBottom: 24 }]}>Código de Sala</Text>

                        <View style={{ padding: 16, backgroundColor: 'white', borderRadius: 16 }}>
                            <QRCode
                                value={Platform.OS === 'web' ? window.location.href : `https://copyeasy.netlify.app/room/${roomCode}`}
                                size={200}
                                color="black"
                                backgroundColor="white"
                            />
                        </View>

                        <Text style={{ color: theme.text, marginTop: 24, fontSize: 20, fontWeight: 'bold' }}>
                            {roomCode}
                        </Text>

                        <TouchableOpacity
                            onPress={() => setQrModalVisible(false)}
                            style={[styles.modalButton, { backgroundColor: theme.background, marginTop: 24, width: '100%' }]}
                        >
                            <Text style={{ color: theme.text }}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {/* Custom Toast Notification */}
            {toastMessage && (
                <View style={[styles.toast, { backgroundColor: theme.primary, zIndex: 1000 }]}>
                    <Text style={{ color: 'black', fontWeight: 'bold' }}>{toastMessage}</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#27272a',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    cardContent: {
        padding: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        gap: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 48,
        maxHeight: 120,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    attachButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4,
    },
    utilButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    modalText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toast: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    }
});
