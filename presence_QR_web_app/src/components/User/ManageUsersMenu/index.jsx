import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const ManageUsersMenu = () => {

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
        if (role === 2) {
            return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
        }
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
                swal(t("SE"), t("SText"), "error");
            }
            setLoading(false)
        }
        if (decodedJWT.user_role === 2) {
            fetchAndSetFacilityLogo()
        } else {
            setLoading(false)
        }
    }, []);

    function displayMenu() {
        return <div className={styles.menu}>
            <Link to="/addUser" className={styles.no_underline}>
                <div className={styles.navigation_box_big}>
                    <div className={styles.navigation_box_big_image_1}></div>
                    {t("manageUsersMenu:addUserButton")}
                </div>
            </Link>
            <Link to="/displayListOfUsers" className={styles.no_underline}>
                <div className={styles.navigation_box_big}>
                    <div className={styles.navigation_box_big_image_2}></div>
                    {t("manageUsersMenu:displayUserListButton")}
                </div>
            </Link>
        </div>
    }

    function displayRole() {
        if (role === 1) {
            return <div className={styles.role_box}>{t("loggedAsAdmin")}</div>
        } else if (role === 2) {
            return <div className={styles.role_box}>{t("loggedAsFacilityManager")}</div>
        } else {
            return <div>{t("roleBoxError")}</div>
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
                            {t("manageUsersMenu:pageName")}
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
export default ManageUsersMenu