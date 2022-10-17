import { createContext, useState, useEffect, useContext } from "react";
import { Auth, DataStore } from 'aws-amplify';
import { Courier} from '../models';

const AuthContext = createContext({});

const AuthContextProvider = ({children}) => {

    const [authUser, setAuthUser] = useState(null);
    const [dbCourier, setDbCourier] = useState(null);
    const [loading, setLoading] = useState(true);
    const sub = authUser?.attributes?.sub;

    useEffect(() => {
        Auth.currentAuthenticatedUser({bypassCache: true}).then(setAuthUser);
        /* console.warn(authUser); */
    }, []);

    useEffect(() => {
        if(!sub) {
            return;
        }
        DataStore.query(Courier, (courier) => courier.sub("eq", sub)).then((couriers) => {
            setDbCourier(couriers[0]);
            setLoading(false);
        });
    }, [sub]);    

    return (
        <AuthContext.Provider value={{authUser, dbCourier, sub, setDbCourier, loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;

export const useAuthContext = () => useContext(AuthContext);