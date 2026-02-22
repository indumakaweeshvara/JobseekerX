export interface UserProfile {
    uid: string;
    email: string | null;
    displayName?: string | null;
}

export type JobType = 'Full-time' | 'Part-time' | 'Remote' | 'Contract';

export interface Job {
    id: string;
    userId: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    description: string;
    requirements: string;
    type: JobType;
    createdAt: any;
}

export type ApplicationStatus = 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';

export interface Application {
    id: string;
    jobId: string;
    userId: string;
    appliedAt: any;
    jobTitle: string;
    company: string;
    status: ApplicationStatus;
}

export interface Bookmark {
    id: string;
    jobId: string;
    userId: string;
    savedAt: any;
    jobTitle: string;
    company: string;
    location: string;
    salary: string;
    type: JobType;
}

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type HomeStackParamList = {
    JobBoard: undefined;
    JobDetails: { job: Job };
};

export type ProfileStackParamList = {
    ProfileMain: undefined;
    MyApplications: undefined;
    SavedJobs: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    AddJob: { job?: Job } | undefined;
    Profile: undefined;
};
