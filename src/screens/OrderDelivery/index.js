import { useRef, useState,useMemo, useEffect } from "react";
import { View, Text, FlatList, Dimensions, useWindowDimensions, ActivityIndicator, Pressable } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { FontAwesome5, Fontisto, Entypo, MaterialIcons, Ionicons } from '@expo/vector-icons';
import orders from '../../../assets/data/orders.json';
import styles from './styles';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from "react-native-maps-directions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { DataStore } from 'aws-amplify';
import { Order, User, OrderDish } from '../../models';
import { useOrderContext } from "../../contexts/OrderContext";
import BottomSheetDetails from "./BottomSheetDetails";
import CustomMarker from "../../components/CustomerMarker";


const OrderDelivery = () => {

   
    const { order, user, dishes, acceptOrder, fetchOrder, completeOrder, pickUpOrder } = useOrderContext();
    const [driverLocation, setDriverLocation] = useState(null);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [totalKm, setTotalKm] = useState(0);
    /* const [activeOrder, setActiveOrder] = useState(null); */
    /* const [deliveryStatus, setDeliveryStatus] = useState(ORDER_STATUSES.READY_FOR_PICKUP); */
    /* const [isDriverClose, setIsDriverClose] = useState(false); */


    
    const mapRef = useRef(null);

    const { width, height } = useWindowDimensions();
    const navigation = useNavigation();
    const route = useRoute();
    const id = route.params?.id;

    useEffect(() => {
        fetchOrder(id);
    }, [id]);    

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
                        /* setIsDriverClose(result.distance <= 0.1) */
                        setTotalMinutes(result.duration);
                        setTotalKm(result.distance);
                    }}
                />
                <CustomMarker data={order.Restaurant} type="RESTAURANT" />
                <CustomMarker data={user} type="USER" />
                {/* <Marker
                coordinate={{latitude: order.Restaurant.latitude, longitude: order.Restaurant.longitude}}
                title={order.Restaurant.name}
                description={order.Restaurant.address}
                >
                    <View style={{backgroundColor: 'green', padding: 5, borderRadius: 20}}>
                        <Entypo name="shop" size={30} color="white"/>
                    </View>                    
                </Marker>
                <Marker
                coordinate={deliveryLocation}
                title={user?.name}
                description={user?.address}
                > 
                    <View style={{backgroundColor: 'green', padding: 5, borderRadius: 20}}>
                        <MaterialIcons name="restaurant" size={30} color="white"/>
                    </View>                   
                </Marker> */}
            </MapView>
            <BottomSheetDetails totalKm={totalKm} totalMinutes={totalMinutes}/>
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