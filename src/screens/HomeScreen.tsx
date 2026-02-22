import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useJobs } from '../context/JobContext';
import { JobCard } from '../components/JobCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList, JobType } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/Input';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'JobBoard'>;

const FILTER_OPTIONS: ('All' | JobType)[] = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract'];

export const HomeScreen = () => {
    const { jobs, loading } = useJobs();
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'All' | JobType>('All');

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchText.toLowerCase()) ||
            job.company.toLowerCase().includes(searchText.toLowerCase());
        const matchesFilter = selectedFilter === 'All' || job.type === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading jobs...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <Input
                        placeholder="Search jobs or companies..."
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            </View>

            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {FILTER_OPTIONS.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.resultHeader}>
                <Text style={styles.resultCount}>
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                </Text>
            </View>

            <FlatList
                data={filteredJobs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <JobCard
                        job={item}
                        onPress={() => navigation.navigate('JobDetails', { job: item })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyTitle}>No jobs found</Text>
                        <Text style={styles.emptyText}>Try a different search or filter</Text>
                    </View>
                }
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
    searchSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        marginRight: -8,
        marginTop: 10,
    },
    filterSection: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    filterScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    filterChipActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    filterText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
    resultHeader: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 4,
    },
    resultCount: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: '#999',
    },
    list: {
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
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
});
