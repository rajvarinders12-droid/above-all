import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    setUser: (user: User | null) => void;
    initialize: () => void;
}

let unsubscribe: any = null;

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    isAdmin: false,
    setUser: (user) => set({ user, isAdmin: ['admin@above-all.com', 'admin2@above-all.com'].includes(user?.email || '') }),
    initialize: () => {
        if (unsubscribe) return;
        unsubscribe = onAuthStateChanged(auth, (user) => {
            set({
                user,
                loading: false,
                isAdmin: ['admin@above-all.com', 'admin2@above-all.com'].includes(user?.email || '')
            });
        });
    }
}));
