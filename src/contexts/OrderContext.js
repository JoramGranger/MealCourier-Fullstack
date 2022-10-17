import { createContext, useState, useEffect, useContext } from "react";
import { Auth, DataStore } from 'aws-amplify';
import { Courier, Order, User, OrderDish} from '../models';
import { useAuthContext } from "./AuthContext";

const OrderContext = createContext({});

const OrderContextProvider = ({children}) => {

    const {dbCourier} = useAuthContext();
    const [ order, setOrder ] = useState();
    const [user, setUser] = useState();
    const [dishes, setDishes] = useState();

    const fetchOrder = async (id) => {
        if(!id) {
            setOrder(null);
            return;
        }
        const fetchedOrder = await DataStore.query(Order,id);
        setOrder(fetchedOrder);
        DataStore.query(User, fetchedOrder.userID).then(setUser);
       DataStore.query(OrderDish, (od) => od.orderID("eq", fetchedOrder.id)).then(setDishes);

        
    }

    const acceptOrder = () => {
        // update order, change status assign to the driver
        DataStore.save(
            Order.copyOf(order, (updated) => {
                updated.status = "ACCEPTED"; // update to accepted
                updated.Courier = dbCourier;
            })
        ).then(setOrder);
    };

    const pickUpOrder = () => {
        // update order, change status assign to the driver
        DataStore.save(
            Order.copyOf(order, (updated) => {
                updated.status = "PICKED_UP"; // update to accepted
                updated.Courier = dbCourier;
            })
        ).then(setOrder);
    };

    const completeOrder = () => {
        // update order, change status assign to the driver
        DataStore.save(
            Order.copyOf(order, (updated) => {
                updated.status = "COMPLETED"; // update to accepted
                updated.Courier = dbCourier;
            })
        ).then(setOrder);
    };

    return (
        <OrderContext.Provider value={{acceptOrder, order, user, dishes, fetchOrder, pickUpOrder, completeOrder}}>
            {children}        
        </OrderContext.Provider>
    );
};

export default OrderContextProvider;

export const useOrderContext = () => useContext(OrderContext);