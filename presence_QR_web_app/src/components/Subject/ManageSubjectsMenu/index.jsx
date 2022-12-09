import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const ManageSubjectsMenu = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")

    const { t } = useTranslation();
    const config = {
        headers: { Authorization: `${sessionStorage.getItem("token")}` }
    };

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

    function displayShortFacilityLogo() {
        return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
    }

    useEffect(() => {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        setRole(decodedJWT.user_role)

        //fetch facility data:
        const fetchAndSetFacilityLogo = async () => {
            try {
                var dataToSend = { id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/facilities/getOneFacilityDataByID/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setFacilityShortLogoLink('http://localhost:8080/logos/' + res[0].facility_logo + '_short.png')
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        fetchAndSetFacilityLogo()
    }, []);

    function displayMenu() {
        return <div className={styles.menu}>
            <Link to="/addSubject" className={styles.no_underline}>
                <div className={styles.navigation_box_big}>
                    <div className={styles.navigation_box_big_image_1}></div>
                    Dodaj przedmiot
                </div>
            </Link>
            <Link to="/displayListOfSubjects" className={styles.no_underline}>
                <div className={styles.navigation_box_big}>
                    <div className={styles.navigation_box_big_image_2}></div>
                    Wyświetl listę przedmiotów
                </div>
            </Link>
        </div>
    }

    function displayRole() {
        if (role === 2) {
            return <div className={styles.role_box}>Zalogowano jako manager placówki</div>
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
                                {displayShortFacilityLogo()}
                            </div>
                            <div className={styles.navbar_center}>
                                Zarządzanie przedmiotami
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
export default ManageSubjectsMenu