import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useJobs } from '../context/JobContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainTabParamList, JobType } from '../types';
import { Ionicons } from '@expo/vector-icons';

type AddJobRouteProp = RouteProp<MainTabParamList, 'AddJob'>;

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Remote', 'Contract'];

const TYPE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
    'Full-time': { icon: 'briefcase', color: '#4F46E5' },
    'Part-time': { icon: 'time', color: '#EA580C' },
    'Remote': { icon: 'globe', color: '#16A34A' },
    'Contract': { icon: 'document-text', color: '#9333EA' },
};

export const AddEditJobScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<AddJobRouteProp>();
    const { addJob, updateJob, deleteJob } = useJobs();

    const editingJob = route.params?.job;

    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [salary, setSalary] = useState('');
    const [type, setType] = useState<JobType>('Full-time');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingJob) {
            setTitle(editingJob.title);
            setCompany(editingJob.company);
            setLocation(editingJob.location);
            setSalary(editingJob.salary);
            setType(editingJob.type);
            setDescription(editingJob.description);
            setRequirements(editingJob.requirements || '');
            navigation.setOptions({ title: 'Edit Job' });
        } else {
            setTitle('');
            setCompany('');
            setLocation('');
            setSalary('');
            setType('Full-time');
            setDescription('');
            setRequirements('');
            navigation.setOptions({ title: 'Post a Job' });
        }
    }, [editingJob]);

    const handleSave = async () => {
        if (!title || !company || !location || !salary || !description) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const jobData = {
                title,
                company,
                location,
                salary,
                type,
                description,
                requirements,
            };

            if (editingJob) {
                await updateJob(editingJob.id, jobData);
            } else {
                await addJob(jobData);
            }
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!editingJob) return;
        Alert.alert('Delete Job', 'Are you sure you want to delete this listing?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    setLoading(true);
                    await deleteJob(editingJob.id);
                    setLoading(false);
                    navigation.goBack();
                }
            }
        ]);
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.headerInfo}>
                <View style={styles.headerIconBg}>
                    <Ionicons name={editingJob ? 'create' : 'add-circle'} size={28} color="#4F46E5" />
                </View>
                <Text style={styles.headerTitle}>{editingJob ? 'Edit Listing' : 'Create Job Listing'}</Text>
                <Text style={styles.headerSubtitle}>Fill in the details below</Text>
            </View>

            <View style={styles.formSection}>
                <Input
                    label="Job Title"
                    placeholder="e.g. Senior React Developer"
                    value={title}
                    onChangeText={setTitle}
                    icon="briefcase-outline"
                />
                <Input
                    label="Company Name"
                    placeholder="e.g. Google"
                    value={company}
                    onChangeText={setCompany}
                    icon="business-outline"
                />
                <Input
                    label="Location"
                    placeholder="e.g. Remote / New York"
                    value={location}
                    onChangeText={setLocation}
                    icon="location-outline"
                />
                <Input
                    label="Salary Range"
                    placeholder="e.g. $100k - $150k"
                    value={salary}
                    onChangeText={setSalary}
                    icon="wallet-outline"
                />
            </View>

            <View style={styles.typeSection}>
                <Text style={styles.typeLabel}>EMPLOYMENT TYPE</Text>
                <View style={styles.typeContainer}>
                    {JOB_TYPES.map((t) => {
                        const config = TYPE_CONFIG[t];
                        const isActive = type === t;
                        return (
                            <TouchableOpacity
                                key={t}
                                style={[styles.typeButton, isActive && { backgroundColor: config.color, borderColor: config.color }]}
                                onPress={() => setType(t)}
                            >
                                <Ionicons name={config.icon} size={16} color={isActive ? '#FFFFFF' : config.color} style={{ marginRight: 6 }} />
                                <Text style={[styles.typeButtonText, isActive && styles.typeButtonTextActive]}>{t}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.formSection}>
                <Input
                    label="Description"
                    placeholder="Describe the role, responsibilities..."
                    value={description}
                    onChangeText={setDescription}
                    icon="document-text-outline"
                    multiline={true}
                    numberOfLines={4}
                />
                <Input
                    label="Requirements (comma-separated)"
                    placeholder="e.g. React, TypeScript, Node.js"
                    value={requirements}
                    onChangeText={setRequirements}
                    icon="list-outline"
                />
            </View>

            <View style={styles.buttonSection}>
                <Button
                    title={editingJob ? "Update Listing" : "Post Job"}
                    onPress={handleSave}
                    loading={loading}
                    icon={editingJob ? 'checkmark-circle' : 'paper-plane'}
                />

                {editingJob && (
                    <Button
                        title="Delete Listing"
                        onPress={handleDelete}
                        variant="danger"
                        loading={loading}
                        icon="trash"
                    />
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#F8FAFC',
        flexGrow: 1,
    },
    headerInfo: {
        alignItems: 'center',
        marginBottom: 24,
    },
    headerIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 4,
        fontWeight: '500',
    },
    formSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    typeSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    typeLabel: {
        fontSize: 13,
        color: '#475569',
        marginBottom: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    typeButtonText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    buttonSection: {
        marginTop: 8,
        marginBottom: 40,
    },
});
