import {
    Button,
    Text,
    TextInput,
    View,
    StyleSheet,
    TouchableOpacity,
    Linking,
    FlatList,
    Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Directory, Paths } from "expo-file-system";
import { Image } from "expo-image";

import { Report, fetchReportsById, getGeneratedPDF, updateReport } from "../api/reports";
import { fetchSuppliers, Supplier } from "../api/suppliers";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

export function ReportDetails({ route }: any) {
    const navigation = useNavigation();
    const { reportId, supplierId } = route.params;
    const { user } = useAuth();

    const [report, setReport] = useState<Report | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"OK" | "DEFECT">();

    const [pdf, setPdf] = useState();

    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // update functionality
    const [updateNotes, setUpdateNotes] = useState("");
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    async function load() {
        try {
            setError(null);
            setLoading(true);

            const data = await fetchReportsById(reportId);
            setReport(data);
            setTitle(data.title || "");
            setDescription(data.description || "");
            setStatus(data.status);
            setUpdateNotes(data.updateNotes || "");
            setSelectedSupplier(supplierId);
        } catch (err: any) {
            setError(err.message ?? "Failed to load supplier");
        } finally {
            setLoading(false);
        }
    }

    // update functionality
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

    async function updateReportHandle() {
        try {
            setError(null);

            if (!title.trim()) {
                setError("Titel ist erforderlich");
                return;
            }

            if (!updateNotes.trim()) {
                setError("Hinweis zum Update ist erforderlich");
                return;
            }

            setSaving(true);
            await updateReport(reportId, {
                title,
                updateNotes,
                description,
                supplierId: selectedSupplier?._id,
                updatedByEmail: user?.email,
                status,
            });

            navigation.goBack();
        } catch (err: any) {
            setError(err.message ?? "Failed to update report");
        } finally {
            setSaving(false);
        }
    }

    async function generatePDF() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/reports/${reportId}/pdf`);
            if (!res.ok) throw new Error("Failed to generate PDF");

            const fileName = `server_${reportId}.pdf`;

            const localFile = new File(Paths.cache, fileName);

            const bytes = await res.arrayBuffer();
            localFile.write(new Uint8Array(bytes));

            console.log("PDF saved at:", localFile.uri);
            // await openPdfInNativeViewer(localFile.uri);
        } catch (err: any) {
            setError(err.massage ?? "PDF konnte nicht generiert werden");
        }
    }

    useEffect(() => {
        load();
        loadSuppliers();
    }, []);

    return (
        <View style={{ padding: 16, gap: 12 }}>
            {loading ? <Text>Loading...</Text> : null}
            {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

            {!loading ? (
                <>
                    <Text style={{ fontWeight: "600" }}>Name</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Name des Lieferanten"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, borderColor: !edit ? "#ccc" : "black" }}
                        editable={edit}
                    />

                    <Text style={{ fontWeight: "600" }}>Beschreibung</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Beschreibung"
                        multiline
                        numberOfLines={4}
                        style={{
                            borderWidth: 1,
                            padding: 8,
                            borderRadius: 4,
                            minHeight: 90,
                            borderColor: !edit ? "#ccc" : "black",
                        }}
                        editable={edit}
                    />

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                status === "OK" ? { backgroundColor: "grey" } : { backgroundColor: "#ccc" },
                            ]}
                            onPress={() => setStatus("OK")}
                            disabled={!edit}
                        >
                            <Text>OK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                status !== "OK" ? { backgroundColor: "grey" } : { backgroundColor: "#ccc" },
                            ]}
                            onPress={() => setStatus("DEFECT")}
                            disabled={!edit}
                        >
                            <Text>DEFECT</Text>
                        </TouchableOpacity>
                    </View>
                    {user?.role === "admin" && !edit && <Button title={"Bearbeiten"} onPress={() => setEdit(true)} />}
                    {user?.role === "admin" && edit && (
                        <Button
                            title={saving ? "Speichern..." : "Aktualisieren"}
                            onPress={updateReportHandle}
                            disabled={saving}
                        />
                    )}
                    <Button title="PDF erstellen" onPress={generatePDF} />
                    {/* <View style={{ padding: 16 }}>
                        <Image
                            style={{}}
                            source="https://picsum.photos/seed/696/3000/2000"
                            contentFit="cover"
                            transition={1000}
                        />
                    </View> */}
                </>
            ) : null}

            {edit && (
                <>
                    <Text>Lieferant: {selectedSupplier ? selectedSupplier.title : "None"}</Text>

                    <Text style={{ fontWeight: "600" }}>Hinweis zum Update</Text>
                    <TextInput
                        value={updateNotes}
                        onChangeText={setUpdateNotes}
                        placeholder="Grund für Update"
                        multiline
                        numberOfLines={4}
                        style={{
                            borderWidth: 1,
                            padding: 8,
                            borderRadius: 4,
                            minHeight: 90,
                            borderColor: !edit ? "#ccc" : "black",
                        }}
                        editable={edit}
                    />

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
                </>
            )}
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
