import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import styles from "./styles.module.css"
import axios from "axios"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"
const Main = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState()

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
        if (role === 2 || role === 3) {
            return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
        }
    }

    useEffect(() => {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        setRole(decodedJWT.user_role)
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
        if (decodedJWT.user_role === 2 || decodedJWT.user_role === 3) {
            fetchAndSetFacilityLogo()
        } else {
            setLoading(false)
        }
    }, []);

    function displayMenu() {
        if (role === 1) {
            return <div className={styles.menu}>
                <Link to="/manageUsersMenu" className={styles.no_underline}>
                    <div className={styles.navigation_box_big}>
                        <div className={styles.navigation_box_big_image_1_admin}></div>
                        {t("mainPage:usersButton")}
                    </div>
                </Link>
                <Link to="/manageFacilitiesMenu" className={styles.no_underline}>
                    <div className={styles.navigation_box_big}>
                        <div className={styles.navigation_box_big_image_2_admin}></div>
                        {t("mainPage:facilitiesButton")}
                    </div>
                </Link>
            </div>
        } else if (role === 2) {
            return <div className={styles.menu_for_manager}>
                <div className={styles.one_line}>
                    <Link to="/manageUsersMenu" className={styles.no_underline_small}>
                        <div className={styles.navigation_box_small}>
                            <div className={styles.navigation_box_sm_image_1_manager}></div>
                            {t("mainPage:usersButton")}
                        </div>
                    </Link>
                    <Link to="/manageClassroomsMenu" className={styles.no_underline_small}>
                        <div className={styles.navigation_box_small}>
                            <div className={styles.navigation_box_sm_image_2_manager}></div>
                            {t("mainPage:classroomsButton")}
                        </div>
                    </Link>
                    <Link to="/manageGroupsMenu" className={styles.no_underline_small}>
                        <div className={styles.navigation_box_small}>
                            <div className={styles.navigation_box_sm_image_3_manager}></div>
                            {t("mainPage:groupsButton")}
                        </div>
                    </Link>
                </div>
                <div className={styles.one_line}>
                    <Link to="/manageSubjectsMenu" className={styles.no_underline_small}>
                        <div className={styles.navigation_box_small}>
                            <div className={styles.navigation_box_sm_image_4_manager}></div>
                            {t("mainPage:subjectsButton")}
                        </div>
                    </Link>
                    <Link to="/manageCalendarMenu" className={styles.no_underline_small}>
                        <div className={styles.navigation_box_small}>
                            <div className={styles.navigation_box_sm_image_5_manager}></div>
                            {t("mainPage:calendarButton")}
                        </div>
                    </Link>
                    <Link to="/manageClassesMenu" className={styles.no_underline_small}>
                        <div className={styles.navigation_box_small}>
                            <div className={styles.navigation_box_sm_image_6_manager}></div>
                            {t("mainPage:classesButton")}
                        </div>
                    </Link>
                </div>
            </div>
        } else if (role === 3) {
            return <div className={styles.menu}>
                <Link to="/presenceListGroupSubject" className={styles.no_underline}>
                    <div className={styles.navigation_box_big}>
                        <div className={styles.navigation_box_big_image_1_lecturer}></div>
                        {t("mainPage:attendanceButton")}
                    </div>
                </Link>
                <Link to="/lessonSchedule" className={styles.no_underline}>
                    <div className={styles.navigation_box_big}>
                        <div className={styles.navigation_box_big_image_2_lecturer}></div>
                        {t("mainPage:scheduleButton")}
                    </div>
                </Link>
            </div>
        } else {
            return <div>{t("roleBoxError")}</div>
        }
    }

    function displayRole() {
        if (role === 1) {
            return <div className={styles.role_box}>{t("loggedAsAdmin")}</div>
        } else if (role === 2) {
            return <div className={styles.role_box}>{t("loggedAsFacilityManager")}</div>
        } else if (role === 3) {
            return <div className={styles.role_box}>{t("loggedAsLecturer")}</div>
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
                                {displayShortFacilityLogo()}
                            </div>
                            <div className={styles.navbar_center}>
                                {t("mainPage:pageName")}
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
export default Main