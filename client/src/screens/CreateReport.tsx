import { View, Text, TextInput, Button, FlatList, Pressable, TouchableOpacity, StyleSheet, Alert } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/core";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import { fetchSuppliers, Supplier } from "../api/suppliers";
import { createReport } from "../api/reports";
import { API_BASE_URL } from "../config/api";

export function CreateReport({ router }: any) {
    const navigation = useNavigation<any>();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const [createdByEmail, setCreatedByEmail] = useState("test@example.com");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"OK" | "DEFECT">("OK");
    const [images, setImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadSuppliers() {
        try {
            setError(null);

            const data = await fetchSuppliers();
            setSuppliers(data);

            setSelectedSupplier((current) => {
                if (!current) return null;

                const freshSelectedSupplier = data.find((supplier) => supplier._id === current._id);

                return freshSelectedSupplier?.isActive === true ? freshSelectedSupplier : null;
            });
        } catch (err: any) {
            setError(err.message ?? "Failed to load suppliers");
        }
    }

    function openCamera() {}

    async function pickImage() {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                "Genehmigung erforderlich",
                "Für den Zugriff auf die Mediathek ist eine Berechtigung erforderlich.",
            );
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);
    }

    async function onCreate() {
        try {
            setError(null);

            if (!selectedSupplier) {
                setError("Please select a supplier");
                return;
            }

            if (!title.trim()) {
                setError("Title is required");
                return;
            }
            if (!createdByEmail.trim()) {
                setError("Email is required");
                return;
            }
            setLoading(true);

            const formData = new FormData();

            formData.append("title", title);
            formData.append("description", description);
            formData.append("supplierId", selectedSupplier._id);
            formData.append("createdByEmail", "");
            formData.append("status", status);

            images.forEach((uri, index) => {
                formData.append("images", {
                    uri,
                    name: `report_${index}.jpg`,
                    type: "image/jpeg",
                } as any);
            });

            const res = await fetch(`${API_BASE_URL}/api/reports/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error(`Failed to create report: ${res.status}`);

            setTitle("");
            setDescription("");
            setCreatedByEmail("");
            setStatus("OK");
            setImages([]);

            Alert.alert("Erfolg", "Ihr Prüfbericht wurde erfolgreich erstellt.", [
                { text: "OK", onPress: () => navigation.navigate("Reports") },
            ]);
            setLoading(false);
        } catch (err: any) {
            setError(err.message ?? "Failed to create report");
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadSuppliers();
        }, []),
    );

    return (
        <View style={{ padding: 16, gap: 12 }}>
            {error && <Text style={{ color: "red" }}>{error}</Text>}

            <Text style={{ fontWeight: "600" }}>Titel</Text>
            <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="z. B. Lieferung von 25.02"
                autoCapitalize="none"
                style={{ borderWidth: 1, padding: 8 }}
            />

            <Text style={{ fontWeight: "600" }}>Beschreibung</Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional"
                style={{ borderWidth: 1, padding: 8, minHeight: 80 }}
                multiline
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TouchableOpacity
                    style={[styles.button, status === "OK" ? { backgroundColor: "grey" } : { backgroundColor: "#ccc" }]}
                    onPress={() => setStatus("OK")}
                >
                    <Text>OK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, status !== "OK" ? { backgroundColor: "grey" } : { backgroundColor: "#ccc" }]}
                    onPress={() => setStatus("DEFECT")}
                >
                    <Text>DEFECT</Text>
                </TouchableOpacity>
            </View>

            <Button title="Media" onPress={pickImage} />

            <Text style={{ fontWeight: "600" }}>Lieferanten auswählen</Text>
            <Button title="Lieferanten neu laden" onPress={loadSuppliers} />

            <FlatList
                data={suppliers}
                keyExtractor={(s) => s._id}
                style={{ maxHeight: 180, borderWidth: 1 }}
                renderItem={({ item }) => {
                    const selected = selectedSupplier?._id === item._id;
                    const isSelectable = item.isActive === true;

                    return (
                        <Pressable
                            onPress={() => {
                                if (isSelectable) setSelectedSupplier(item);
                            }}
                            disabled={!isSelectable}
                            style={[
                                {
                                    padding: 10,
                                    borderBottomWidth: 1,
                                    backgroundColor: selected ? "#eaeaea" : "transparent",
                                    opacity: isSelectable ? 1 : 0.5,
                                },
                                !isSelectable && { backgroundColor: "#f1f1f1" },
                            ]}
                        >
                            <Text>{item.title}</Text>
                            {!isSelectable ? <Text>Inaktiv</Text> : null}
                        </Pressable>
                    );
                }}
            />

            <Text>Liferant: {selectedSupplier ? selectedSupplier.title : "None"}</Text>

            <Button title={loading ? "Speichern..." : "Bericht speichern"} onPress={onCreate} disabled={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        color: "white",
        width: "50%",
    },
});
