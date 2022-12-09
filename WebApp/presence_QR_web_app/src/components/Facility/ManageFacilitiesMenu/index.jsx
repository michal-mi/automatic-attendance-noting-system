import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs";

const ManageFacilitiesMenu = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()

    const { t } = useTranslation();

    const handleLogout = () => {
        sessionStorage.removeItem("token")
        window.location.reload()
    }

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        setRole(decodedJWT.user_role)
        setLoading(false)
    }, []);

    function displayMenu() {
        return <div className={styles.menu}>
            <Link to="/addFacility" className={styles.no_underline}>
                <div className={styles.navigation_box_big}>
                    <div className={styles.navigation_box_big_image_1}></div>
                    Dodaj placówkę
                </div>
            </Link>
            <Link to="/displayListOfFacilities" className={styles.no_underline}>
                <div className={styles.navigation_box_big}>
                    <div className={styles.navigation_box_big_image_2}></div>
                    Wyświetl listę placówek
                </div>
            </Link>
        </div>
    }

    function displayRole() {
        if (role === 1) {
            return <div className={styles.role_box}>Zalogowano jako administrator</div>
        } else {
            return <div>Wystąpił błąd!!</div>
        }
    }

    return (
        <div className={styles.body_container}>
            {isLoading ?
                <div className={styles.loader}>
                    <Oval
                        height="150"
                        width="150"
                        color="#ff9742"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                        ariaLabel='oval-loading'
                        secondaryColor="#B1D2EC"
                        strokeWidth={2}
                        strokeWidthSecondary={2}
                    />
                </div>
                :
            <div className={styles.menu_container}>
                <div className={styles.element_group}>
                    <div className={styles.navbar}>
                        <div className={styles.navbar_left}>
                            <Link to="/">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                        </div>
                        <div className={styles.navbar_center}>
                            Zarządzanie placówkami
                        </div>
                        <div className={styles.navbar_right}>
                            <button type="button" onClick={handleLogout} className={styles.navbar_button}>
                                <BsBoxArrowLeft />
                            </button>
                            <Link to="/myAccount" className={styles.navbar_button}>
                                <BsPersonCircle />
                            </Link>
                            <Link to="/settings" className={styles.navbar_button}>
                                <BsFillGearFill />
                            </Link>
                        </div>
                    </div>
                    {displayMenu()}
                </div>
            </div>
        }
            {displayRole()}
        </div>

    )
}
export default ManageFacilitiesMenu