import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useJobs } from '../context/JobContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainTabParamList, JobType } from '../types';

type AddJobRouteProp = RouteProp<MainTabParamList, 'AddJob'>;

const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Remote', 'Contract'];

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
            Alert.alert('Error', 'Please fill in all fields');
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
        <ScrollView contentContainerStyle={styles.container}>
            <Input
                label="Job Title"
                placeholder="e.g. Senior React Developer"
                value={title}
                onChangeText={setTitle}
            />
            <Input
                label="Company Name"
                placeholder="e.g. Google"
                value={company}
                onChangeText={setCompany}
            />
            <Input
                label="Location"
                placeholder="e.g. Remote / New York"
                value={location}
                onChangeText={setLocation}
            />
            <Input
                label="Salary Range"
                placeholder="e.g. $100k - $150k"
                value={salary}
                onChangeText={setSalary}
            />

            <Text style={styles.label}>Employment Type</Text>
            <View style={styles.typeContainer}>
                {JOB_TYPES.map((t) => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.typeButton, type === t && styles.typeButtonActive]}
                        onPress={() => setType(t)}
                    >
                        <Text style={[styles.typeButtonText, type === t && styles.typeButtonTextActive]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Input
                label="Description"
                placeholder="Describe the role..."
                value={description}
                onChangeText={setDescription}
            />

            <Input
                label="Requirements (comma-separated)"
                placeholder="e.g. React, TypeScript, Node.js"
                value={requirements}
                onChangeText={setRequirements}
            />

            <View style={styles.spacer} />

            <Button title={editingJob ? "Update Listing" : "Post Job"} onPress={handleSave} loading={loading} />

            {editingJob && (
                <Button title="Delete Listing" onPress={handleDelete} variant="danger" loading={loading} />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        fontWeight: '600',
        marginTop: 10,
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    typeButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    typeButtonText: {
        fontSize: 13,
        color: '#666',
    },
    typeButtonTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    spacer: {
        height: 20,
    },
});
