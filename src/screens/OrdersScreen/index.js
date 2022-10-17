import { useRef, useState,useMemo, useEffect } from "react";
import { View, Text, FlatList, Dimensions, useWindowDimensions, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import orders from '../../../assets/data/orders.json'
import OrderItem from "../../components/OrderItem";
import MapView, { Marker } from 'react-native-maps';
import { Entypo } from "@expo/vector-icons";
import { DataStore } from 'aws-amplify';
import { Order } from '../../models';
import CustomMarker from "../../components/CustomerMarker";

const OrdersScreen = () => {

    const [orders, setOrders] = useState([]);
    const bottomSheetRef = useRef(null);
    const { width, height } = useWindowDimensions();
    const snapPoints = useMemo(() => ["12%", "80%"], []);

    useEffect(() => {
        DataStore.query(Order, (order) => order.status("eq", "READY_FOR_PICKUP")).then(setOrders);
    }, []);


    return ( 
        <View style={{backgroundColor: 'lightgrey', flex: 1}}>
            <MapView style={{height, width }}
            showsUserLocation 
            followsUserLocation
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