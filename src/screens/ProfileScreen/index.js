import { View, Text, TextInput, StyleSheet, Button, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Auth, DataStore } from "aws-amplify";
import { Courier } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
  const { dbCourier, sub, setDbCourier } = useAuthContext();

  const [name, setName] = useState(dbCourier?.name || "");
  const [address, setAddress] = useState(dbCourier?.address || "");
  const [latitude, setlatitude] = useState(dbCourier?.latitude + "" || "0");
  const [longitude, setlongitude] = useState(dbCourier?.longitude + "" || "0");

  /* const { sub, setDbUser } = useAuthContext(); */

  const navigation = useNavigation();

  const onSave = async () => {
    if (dbCourier) {
      await updateCourier();
    } else {
      await createCourier();
    }
    navigation.goBack();
  };

  const updateCourier = async () => {
    const courier = await DataStore.save(
      Courier.copyOf(dbCourier, (updated) => {
        updated.name = name;
        updated.address = address;
        updated.latitude = parseFloat(latitude);
        updated.longitude = parseFloat(longitude);
      })
    );
    setDbCourier(courier);
  };

  const createCourier = async () => {
    try {
      const courier = await DataStore.save(
        new Courier({
          name,
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          sub,
        })
      );
      setDbCourier(courier);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView>
      <Text style={styles.title}>Profile</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={styles.input}
      />
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Address"
        style={styles.input}
      />
      <TextInput
        value={latitude}
        onChangeText={setlatitude}
        placeholder="latitudeitude"
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        value={longitude}
        onChangeText={setlongitude}
        placeholder="Longitude"
        style={styles.input}
      />
      <Button onPress={onSave} title="Save" />
      <Text
        onPress={() => Auth.signOut()}
        style={{ textAlign: "center", color: "red", margin: 10 }}
      >
        Sign out
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
  },
  input: {
    margin: 10,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
  },
});

export default Profile;
