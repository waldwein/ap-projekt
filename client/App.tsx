import { StyleSheet, Text, View, Button } from "react-native";
import { SuppliersScreen } from "./src/screens/SuppliersScreen";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SupplierDetails } from "./src/screens/SupplierDetails";
import { ReportsScreen } from "./src/screens/ReportsScreen";
import { ReportDetails } from "./src/screens/ReportDetails";
import { CreateReport } from "./src/screens/CreateReport";
import { LoginScreen } from "./src/screens/LoginScreen";

function HomeScreen() {
    const navigation = useNavigation<any>();
    return (
        <View style={{ padding: 16, gap: 12 }}>
            <Button title={"Lieferanten"} onPress={() => navigation.navigate("SuppliersScreen")} />
            <Button title={"Berichte"} onPress={() => navigation.navigate("ReportsScreen")} />
            <Button title={"Bericht erstellen"} onPress={() => navigation.navigate("CreateReport")} />
            <Button title={"Ausloggen"} onPress={() => console.log("loggout")} />
        </View>
    );
}

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="SuppliersScreen" options={{ title: "Lieferanten" }} component={SuppliersScreen} />
                <Stack.Screen
                    name="SupplierDatails"
                    options={{ title: "Lieferantendetails" }}
                    component={SupplierDetails}
                />
                <Stack.Screen name="ReportsScreen" options={{ title: "Berichte" }} component={ReportsScreen} />
                <Stack.Screen name="ReportDetails" options={{ title: "Berichtsdetails" }} component={ReportDetails} />
                <Stack.Screen name="CreateReport" options={{ title: "Bericht erstellen" }} component={CreateReport} />
                <Stack.Screen name="Login" options={{ title: "Einloggen" }} component={LoginScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
