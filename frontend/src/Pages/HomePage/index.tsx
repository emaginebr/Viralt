import { useContext, useEffect, useState } from "react";
import AuthContext from "../../Contexts/Auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Hero from "./Hero";
import Footer from "../../Components/Footer";
import Features from "./Features";
import Pricing from "./Pricing";
import NetworkPart from "./NetworkPart";
import UserPart from "./UserPart";
import UserContext from "../../Contexts/User/UserContext";
import NetworkContext from "../../Contexts/Network/NetworkContext";
import AOS from 'aos';


export default function HomePage() {

    const userContext = useContext(UserContext);
    const networkContext = useContext(NetworkContext);

    let navigate = useNavigate();


    useEffect(() => {
        AOS.init();
      }, [])
    /*
    useEffect(() => {
        userContext.list(3).then((ret) => {
            if (!ret.sucesso) {
                alert(ret.mensagemErro);
            }
        });
        networkContext.listAll().then((ret) => {
            if (!ret.sucesso) {
                alert(ret.mensagemErro);
            }
        });
    }, []);
    */

    return (
        <>
            <Hero />
            <Features />
            <NetworkPart 
                loading={networkContext.loading} 
                networks={networkContext.networks} 
            />
            <Pricing />
            <UserPart 
                loading={userContext.loadingList}
                users={userContext.users} 
            />
            <Footer />
        </>
    );

}