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
import { Order, User } from '../../models';

// AIzaSyDYj8QLP7gEVH2SchTLYZ0VkjQzC9teRBY

/* const order = orders[0]; */

const ORDER_STATUSES = {
    READY_FOR_PICKUP: "READY_FOR_PICKUP",
    ACCEPTED: "ACCEPTED",
    PICKED_UP: "PICKED_UP"
}

const OrderDelivery = () => {


    const [order, setOrder] = useState(null);
    const [user, setUser] = useState(null);
    const [dishItems, setDishItems] = useState([]);
    const [driverLocation, setDriverLocation] = useState(null);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [totalKm, setTotalKm] = useState(0);
    /* const [activeOrder, setActiveOrder] = useState(null); */
    const [deliveryStatus, setDeliveryStatus] = useState(ORDER_STATUSES.READY_FOR_PICKUP);
    const [isDriverClose, setIsDriverClose] = useState(false);


    const bottomSheetRef = useRef(null);
    const mapRef = useRef(null);

    const { width, height } = useWindowDimensions();
    const snapPoints = useMemo(() => ["12%", "95%"], []);
    const navigation = useNavigation();
    const route = useRoute();
    const id = route.params?.id;

    useEffect(() => {
        if(!id) {
            return;
        }
        DataStore.query(Order, id).then(setOrder);
    }, [id]);

    useEffect(() => {
        if(!order) {
            return;
        }
        DataStore.query(User, order.userID).then(setUser);
        DataStore.query(OrderDish, (od) => od.orderID("eq", order.id)).then(setDishItems);
    }, [order])

    

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

    const onButtonPressed = () => {
        if(deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP) {
            bottomSheetRef.current?.collapse();
            mapRef.current.animateToRegion({
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });

            setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
        }
        if(deliveryStatus === ORDER_STATUSES.ACCEPTED) {
            bottomSheetRef.current?.collapse();
            setDeliveryStatus(ORDER_STATUSES.PICKED_UP);
        }
        if(deliveryStatus === ORDER_STATUSES.PICKED_UP) {
            bottomSheetRef.current?.collapse();
            navigation.goBack();
            console.warn('Delivery Finished');
        }
    };

    const renderButtonTitle = () => {
        if(deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP) {
            return 'Accept Order';
        }
        if(deliveryStatus === ORDER_STATUSES.ACCEPTED) {
            return 'Pic-Up Order';
        }
        if(deliveryStatus === ORDER_STATUSES.PICKED_UP) {
            return 'Complete Delivery';
        }
    };

    const isButtonDisabled =() => {
        if(deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP) {
            return false;
        }
        if(deliveryStatus === ORDER_STATUSES.ACCEPTED && isDriverClose) {
            return close;
        }
        if(deliveryStatus === ORDER_STATUSES.PICKED_UP && isDriverClose) {
            return false;
        }
        return true;
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
                    destination={ deliveryStatus === ORDER_STATUSES.ACCEPTED ? restaurantLocation : deliveryLocation}
                    strokeWidth={10}
                    waypoints={ deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP ? [restaurantLocation] :[] }
                    strokeColor="#3fc060"
                    apikey={"AIzaSyDYj8QLP7gEVH2SchTLYZ0VkjQzC9teRBY"}
                    onReady={(result) => { 
                        setIsDriverClose(result.distance <= 0.1)
                        setTotalMinutes(result.duration);
                        setTotalKm(result.distance);
                    }}
                />
                <Marker
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
                title={user.name}
                description={user.address}
                > 
                    <View style={{backgroundColor: 'green', padding: 5, borderRadius: 20}}>
                        <MaterialIcons name="restaurant" size={30} color="white"/>
                    </View>                   
                </Marker>
            </MapView>
            {deliveryStatus === ORDER_STATUSES.READY_FOR_PICKUP && (
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
            <BottomSheet 
            ref={bottomSheetRef} 
            snapPoints={snapPoints}
            handleIndicatorStyle={styles.handleIndicator}
            >
                <View style={styles.handleIndicatorContainer}>
                    <Text style={styles.routeDetailsText}>{totalMinutes.toFixed(0)} Mins</Text>
                    <FontAwesome5 name="shopping-bag" size={30} color="#3fc060" style={{
                        marginHorizontal: 10
                    }}/>
                    <Text style={styles.routeDetailsText}>{totalKm.toFixed(2)}Km</Text>
                </View>

                <View style={styles.orderDeilveryDetailsContainer}>
                    <Text style={styles.restaurantName}>{order.Restaurant.name}</Text> 
                    <View style={styles.addressContainer}>
                        <Fontisto name="shopping-store" size={22} color="grey" />
                        <Text style={styles.addressText}>{order.Restaurant.address}</Text>                         
                    </View>
                    <View style={styles.addressContainer}>
                        <FontAwesome5 name="map-marker-alt" size={30} color="grey" />
                        <Text style={styles.addressText}>{user.address}</Text>                                               
                    </View>
                    
                    <View style={styles.orderDetailsContainer}>
                        <Text style={styles.orderItemText}>Onion Rings x1</Text> 
                        <Text style={styles.orderItemText}>Chicken Drum x1</Text>
                        <Text style={styles.orderItemText}>Chapat x3</Text> 
                        <Text style={styles.orderItemText}>Coca Cola coke x2</Text> 
                </View>
                </View>
                <Pressable 
                onPress={onButtonPressed} 
                disabled={isButtonDisabled()} 
                style={{...styles.buttonContainer, backgroundColor: isButtonDisabled() ? 'grey' : '#3fc060' }}>
                    <Text style={styles.buttonText}>{renderButtonTitle()}</Text>
                </Pressable>

                
            </BottomSheet>
        </View>
     );
}
 
export default OrderDelivery;