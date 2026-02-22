import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { Job } from '../types';

interface JobContextType {
    jobs: Job[];
    loading: boolean;
    addJob: (jobData: Omit<Job, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
    updateJob: (id: string, data: Partial<Job>) => Promise<void>;
    deleteJob: (id: string) => Promise<void>;
}

const JobContext = createContext<JobContextType>({} as JobContextType);

export const useJobs = () => useContext(JobContext);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setJobs([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'jobs'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const jobsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Job[];
            setJobs(jobsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching jobs: ", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [user]);

    const addJob = async (jobData: Omit<Job, 'id' | 'userId' | 'createdAt'>) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'jobs'), {
                ...jobData,
                userId: user.uid,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error adding job: ", error);
            throw error;
        }
    };

    const updateJob = async (id: string, data: Partial<Job>) => {
        try {
            const jobRef = doc(db, 'jobs', id);
            await updateDoc(jobRef, data);
        } catch (error) {
            console.error("Error updating job: ", error);
            throw error;
        }
    };

    const deleteJob = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'jobs', id));
        } catch (error) {
            console.error("Error deleting job: ", error);
            throw error;
        }
    };

    return (
        <JobContext.Provider value={{ jobs, loading, addJob, updateJob, deleteJob }}>
            {children}
        </JobContext.Provider>
    );
};
