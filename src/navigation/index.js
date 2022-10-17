import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDelivery from '../screens/OrderDelivery';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuthContext } from '../contexts/AuthContext';
import { ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

const Navigation = () => {

    const {dbCourier, loading } = useAuthContext();
    if(loading) {
        return <ActivityIndicator size={"large"} color="black" />
    }

    return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
        {dbCourier
        ? 
        (
            <>
                <Stack.Screen name="OrderScreen" component={OrdersScreen}/>
                <Stack.Screen name="OrderDelivery" component={OrderDelivery}/>
            </>

        ) 
        : 
        (
            <Stack.Screen name="Profile" component={ProfileScreen} />
        )}
        
    </Stack.Navigator>
    );
}
 
export default Navigation;