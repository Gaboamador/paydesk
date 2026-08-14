import React, {useContext} from "react";
import UserContext from "../../context/userContext";
import styles from "./Header.module.scss";
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import Logo from '../Logo';


const Header = () => {
    const { user } = useContext(UserContext);
        const handleLogout = async () => {
        await signOut(auth);
      };
    
return (
    <header id="header" className={styles.header}>
        <div className={styles.logoTitulo}>
        <Logo className={styles.logo} />
        <div className={styles.titulo}>PayDesk</div>
        </div>
        {user &&
        <>
        <button className={`btn btn--secundario ${styles.logOutButton}`} onClick={handleLogout}>Cerrar sesión</button>
        </>
        }
    </header>
)
};

export default Header;
