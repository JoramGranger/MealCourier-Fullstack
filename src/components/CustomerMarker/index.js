import { Marker } from "react-native-maps";
import { View } from "react-native";
import { FontAwesome5, Fontisto, Entypo, MaterialIcons, Ionicons } from '@expo/vector-icons';

const CustomMarker = ({data, type}) => {
    return ( 
        <Marker
                coordinate={{
                    latitude: data.latitude,
                    longitude: data.longitude
                }}
                title={data.name}
                description={data.address}
                >
                    <View style={{backgroundColor: 'green', padding: 5, borderRadius: 20}}>
                        {
                            type === "RESTAURANT"
                            ? 
                            (<Entypo name="shop" size={30} color="white"/>)
                            :
                            (<MaterialIcons name="restaurant" size={30} color="white"/>)
                        }
                    </View>                    
                </Marker>
     );
}
 
export default CustomMarker;