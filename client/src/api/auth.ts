import { API_BASE_URL } from "../config/api";

export type User = {
    _id: string;
    name: string;
    email: string;
    password: string;
};

export type AuthProvider = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
};

export async function loginUser(input: { email: string; password: string }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Failed to login: ${res.status}`);
    return res.json();
}
