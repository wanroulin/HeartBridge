'use clint';

import React, {createContext, useContext, useState, useEffect } from "react";
import { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../lib/firebase/config';
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../lib/types';
import { useTheme } from "./ThemeContext";
import { unsubscribe } from "diagnostics_channel";

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext <AuthContextType | undefined>(undefined);

export function AuthProvider({ children } : {children: React.ReactNode}) {
    const [ user, setUser ] = useState <User | null>(null);
    const [ firebaseUser, setFirebaseUser ] = useState<FirebaseUser | null>(null);
    const [loading, setLoading ] = useState(true);
    const { setTheme } = useTheme();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setFirebaseUser(firebaseUser);

            if (firebaseUser) {
                // 從 firebase 取得 user 資料
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        setUser(userData);

                        // 根據 user 設定 theme
                        if (userData.role === 'parent') {
                            setTheme('parent');
                        } else if (userData.role === 'teen') {
                            setTheme('teen');
                        }
                    } else {
                        setUser(null);
                    }
                } catch (error) {
                    console.error ('Error fetching user data', error);
                    setUser(null);
                }
            } else {
                setUser(null);
                setTheme('neutral');
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [setTheme]);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setFirebaseUser(null);
            setTheme('neutral');
        } catch (error) {
            console.error('Error signing out: ', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}