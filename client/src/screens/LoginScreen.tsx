import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export function LoginScreen() {
    const { login } = useAuth();
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        try {
            setError("");
            setLoading(true);

            await login(email, password);

            setEmail("");
            setPassword("");
            navigation.navigate("Home");
        } catch (err: any) {
            setError(err.message ?? "Login fehlgeschlagen");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <View style={{ padding: 16, gap: 12 }}>
                {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

                <Text style={{ fontWeight: "600" }}>E-Mail</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    // placeholder="max.mustermann@firma.de"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={{ borderWidth: 1, padding: 8 }}
                />

                <Text style={{ fontWeight: "600" }}>Passwort</Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={{ borderWidth: 1, padding: 8 }}
                />

                <Button title={loading ? "Einloggen..." : "Einloggen"} onPress={handleLogin} disabled={loading} />
            </View>
        </>
    );
}
