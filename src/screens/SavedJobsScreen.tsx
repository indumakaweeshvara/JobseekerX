import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Bookmark } from '../types';
import { Ionicons } from '@expo/vector-icons';

export const SavedJobsScreen = () => {
    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'bookmarks'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as Bookmark[];
            setBookmarks(data);
            setLoading(false);
        });

        return unsubscribe;
    }, [user]);

    const handleRemove = async (bookmarkId: string) => {
        try {
            await deleteDoc(doc(db, 'bookmarks', bookmarkId));
        } catch (error: any) {
            console.error('Error removing bookmark:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (bookmarks.length === 0) {
        return (
            <View style={styles.centered}>
                <Ionicons name="bookmark-outline" size={64} color="#CCC" />
                <Text style={styles.emptyTitle}>No saved jobs</Text>
                <Text style={styles.emptyText}>Bookmark jobs you're interested in</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={bookmarks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardInfo}>
                                <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                                <Text style={styles.company}>{item.company}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
                                <Ionicons name="bookmark" size={24} color="#FF9500" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.cardDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={14} color="#888" />
                                <Text style={styles.detailText}>{item.location}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="cash-outline" size={14} color="#888" />
                                <Text style={styles.detailText}>{item.salary}</Text>
                            </View>
                        </View>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeText}>{item.type}</Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#999',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#BBB',
        marginTop: 6,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    company: {
        fontSize: 14,
        color: '#007AFF',
        marginTop: 2,
    },
    removeBtn: {
        padding: 4,
    },
    cardDetails: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#888',
    },
    typeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 10,
    },
    typeText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: 'bold',
    },
});
