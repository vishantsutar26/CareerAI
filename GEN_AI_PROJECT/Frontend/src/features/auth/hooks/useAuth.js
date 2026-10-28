import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);
    const {user, setUser, loading, setLoading} = context;

    const handleLogin = async ({email,password})=>{
        setLoading(true);
        try{
            const data = await login({email,password});
            setUser(data.user);
            return data.user;
        }
        catch(err){
            throw err; // let the caller (Login page) show the error / decide navigation
        }finally{
        setLoading(false);
        }
    }

    const handleRegister = async ({username,email,password})=>{
        setLoading(true);
        try{
            const data = await register({username,email,password});
            setUser(data.user);
            return data.user;
        }
        catch(err){
            throw err; // let the caller (Register page) show the error / decide navigation
        }finally{
        setLoading(false);
        }
    }

    const handleLogout = async () => {
        setLoading(true);
        try{
            await logout();
            setUser(null);
        }
        catch(err){
            throw err;
        }finally{
        setLoading(false);
        }
    }

    return {user,loading,handleLogin,handleRegister,handleLogout};
}
