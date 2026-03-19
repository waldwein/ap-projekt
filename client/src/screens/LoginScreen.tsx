import { useState } from "react";
import { User, loginUser } from "../api/auth";
import { Button, Text, TextInput, View } from "react-native";

export function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [user, setUser] = useState<User>();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    async function login() {
        try {
            setLoading(true);
            setUser(await loginUser({ email, password }));
            setEmail("");
            setPassword("");
        } catch (err: any) {
            setError(err.message ?? "Failed to login");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <View style={{ padding: 16, gap: 12 }}>
                {error && <Text style={{ color: "red" }}>{error}</Text>}

                <Text style={{ fontWeight: "600" }}>E-Mail</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@mail.com"
                    style={{ borderWidth: 1, padding: 8 }}
                />

                <Text style={{ fontWeight: "600" }}>Password</Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={{ borderWidth: 1, padding: 8, minHeight: 80 }}
                />
                <Button title={loading ? "Einloggen..." : "Einloggen"} onPress={login} disabled={loading} />
            </View>
        </>
    );
}
