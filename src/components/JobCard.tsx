import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Job } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface JobCardProps {
    job: Job;
    onPress: () => void;
    onDelete?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress, onDelete }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{job.title}</Text>
                    <Text style={styles.company}>{job.company}</Text>
                </View>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{job.type}</Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{job.location}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{job.salary}</Text>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>{job.description}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginVertical: 10,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    company: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    typeBadge: {
        backgroundColor: '#E8F2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    details: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#666',
    },
    description: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
});
