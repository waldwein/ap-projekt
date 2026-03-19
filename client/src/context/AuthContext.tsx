import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../api/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!token && !!user;
    useEffect(() => {}, []);

    async function loadsStoredAuth() {
        try {
            const [storedToken, storedUser] = await Promise.all([
                AsyncStorage.getItem("authToken"),
                AsyncStorage.getItem("userData"),
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } finally {
            setLoading(false);
        }
    }

    
}
