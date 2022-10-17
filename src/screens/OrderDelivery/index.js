import { useRef, useState, useEffect } from "react";
import { View, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from "react-native-maps-directions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useOrderContext } from "../../contexts/OrderContext";
import BottomSheetDetails from "./BottomSheetDetails";
import CustomMarker from "../../components/CustomerMarker";
import { useAuthContext } from "../../contexts/AuthContext";
import { Courier } from "../../models";
import { DataStore } from 'aws-amplify';


const OrderDelivery = () => {

   
    const { order, user, dishes, acceptOrder, fetchOrder, completeOrder, pickUpOrder } = useOrderContext();
    const [driverLocation, setDriverLocation] = useState(null);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [totalKm, setTotalKm] = useState(0);
    /* const [activeOrder, setActiveOrder] = useState(null); */
    /* const [deliveryStatus, setDeliveryStatus] = useState(ORDER_STATUSES.READY_FOR_PICKUP); */
    /* const [isDriverClose, setIsDriverClose] = useState(false); */

    const { dbCourier } = useAuthContext();
    
    const mapRef = useRef(null);

    const { width, height } = useWindowDimensions();
    const navigation = useNavigation();
    const route = useRoute();
    const id = route.params?.id;

    useEffect(() => {
        fetchOrder(id);
    }, [id]); 
    
    useEffect(() => {
        if(!driverLocation) {
            return;
        }
        DataStore.save(
            Courier.copyOf(dbCourier, (updated) => {
                updated.latitude = driverLocation.latitude;
                updated.longitude = driverLocation.longitude;
        })
      );
    }, [driverLocation]);
    

    useEffect(() => {
        /* const getDeliveryLocations =  */(async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if(!status === 'granted') {
                console.warn('Nah');
                return;
            }
            let location = await Location.getCurrentPositionAsync();
            setDriverLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        })
        /* getDeliveryLocations */();
        const foregroundSubscription = Location.watchPositionAsync (
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 100
            }, (updatedLocation) => {
                setDriverLocation({
                    latitude: updatedLocation.coords.latitude,
                    longitude: updatedLocation.coords.longitude,
                });
            }
        );
        return foregroundSubscription;
    }, []);

    const zoomInOnDriver = () => {
        mapRef.current.animateToRegion({
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
        });
    };

    const restaurantLocation = {
        latitude: order?.Restaurant?.latitude, 
        longitude: order?.Restaurant?.longitude,
    };
    
    const deliveryLocation = {
        latitude: user?.latitude,
        longitude: user?.longitude,
    };

    if(!order || !user || !driverLocation) {
        return <ActivityIndicator size={"large"} color="grey" />
    }

    return ( 
        <View style={styles.container}>
            <MapView style={{width, height}}
                ref={mapRef}
                showsUserLocation
                followsUserLocation
                initialRegion={{
                    latitude: driverLocation.latitude,
                    longitude: driverLocation.longitude,
                    latitudeDelta: 0.07,
                    longitudeDelta: 0.07,
                }}
            >
                <MapViewDirections 
                    origin={driverLocation}
                    destination={ order.status === "ACCEPTED" ? restaurantLocation : deliveryLocation}
                    strokeWidth={10}
                    waypoints={ order.status === "READY_FOR_PICKUP" ? [restaurantLocation] :[] }
                    strokeColor="#3fc060"
                    apikey={"AIzaSyDYj8QLP7gEVH2SchTLYZ0VkjQzC9teRBY"}
                    onReady={(result) => { 
                        setTotalMinutes(result.duration);
                        setTotalKm(result.distance);
                    }}
                />
                <CustomMarker data={order.Restaurant} type="RESTAURANT" />
                <CustomMarker data={user} type="USER" />
            </MapView>
            <BottomSheetDetails totalKm={totalKm} totalMinutes={totalMinutes} onAccepted={zoomInOnDriver} />
            {order.status === "READY_FOR_PICKUP" && (
                <Ionicons 
                onPress={() => navigation.goBack()}
                name="arrow-back-circle"
                size={45}
                color="black"
                style={{
                    top: 40, 
                    left: 15, 
                    position: 'absolute'
                }}
                /> 
            )
            }
            
        </View>
     );
}
 
export default OrderDelivery;