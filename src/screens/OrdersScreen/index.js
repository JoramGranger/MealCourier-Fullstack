import { useRef, useState,useMemo, useEffect } from "react";
import { View, Text, FlatList, Dimensions, useWindowDimensions, ActivityIndicator } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import OrderItem from "../../components/OrderItem";
import MapView, { Marker } from 'react-native-maps';
import { DataStore } from 'aws-amplify';
import { Order } from '../../models';
import CustomMarker from "../../components/CustomerMarker";
import * as Location from 'expo-location';

const OrdersScreen = () => {

    const [orders, setOrders] = useState([]);
    const bottomSheetRef = useRef(null);
    const { width, height } = useWindowDimensions();
    const snapPoints = useMemo(() => ["12%", "80%"], []);
    const [driverLocation, setDriverLocation] = useState(null);

    const fetchOrder = () => {
        DataStore.query(Order, (order) => order.status("eq", "READY_FOR_PICKUP")).then(setOrders);        
    }

    useEffect(() => {
        fetchOrder();
        const subscription = DataStore.observe(Order).subscribe((msg) => {
            if(msg.opType === "UPDATE") {
                fetchOrder();
            }
        });        
    }, []);

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

    if(!driverLocation) {
        return <ActivityIndicator size={"large"} color="grey" />
    }


    return ( 
        <View style={{backgroundColor: 'lightgrey', flex: 1}}>
            <MapView style={{height, width }}
            showsUserLocation 
            followsUserLocation
            initialRegion={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
            }}
            >
                {orders.map((order) => (
                    <CustomMarker key={order.id} data={order.Restaurant} type="RESTAURANT" />
                ))}
                
            </MapView>
            <BottomSheet 
            ref={bottomSheetRef} 
            snapPoints={snapPoints}
            >                
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={{
                        fontSize: 20, 
                        fontWeight: '600', 
                        letterSpacing: 0.5,
                        paddingBottom: 1
                        }}>You're Online
                    </Text>

                    <Text style={{
                        letterSpacing: 0.5, color: 'grey'
                        }}>Available Orders: {orders.length}
                    </Text>
                    
                </View>
                <FlatList data={orders} renderItem={({item}) => <OrderItem order={item} /> }/>
            </BottomSheet> 
        </View>           
       
     );
}
 
export default OrdersScreen;