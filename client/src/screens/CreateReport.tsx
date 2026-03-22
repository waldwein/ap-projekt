import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, Pressable, TouchableOpacity, StyleSheet } from "react-native";
import { fetchSuppliers, Supplier } from "../api/suppliers";
import { createReport } from "../api/reports";
import { useFocusEffect, useNavigation } from "@react-navigation/core";

export function CreateReport() {
    const navigation = useNavigation<any>();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const [createdByEmail, setCreatedByEmail] = useState("test@example.com");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"OK" | "DEFECT">("OK");

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

            await createReport({
                title,
                description,
                supplierId: selectedSupplier._id,
                createdByEmail,
                status,
            });

            setTitle("");
            setDescription("");
            setCreatedByEmail("");
            setStatus("OK");

            navigation.navigate("Reports");
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

            <Button title="Media" onPress={() => {}} />

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
