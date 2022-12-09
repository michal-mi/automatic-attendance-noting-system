import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsBoxArrowLeft, BsFillArrowLeftCircleFill, BsPersonCircle } from "react-icons/bs";
const Settings = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    
    const { t } = useTranslation();
    const config = {
        headers: { Authorization: `${sessionStorage.getItem("token")}` }
    };

    // Contains the value and text for the options
    const languages = [
        { value: 'pl', text: "Polski" },
        { value: 'en', text: "English" },
        { value: 'de', text: "Deutsch" },
    ]

    const [lang, setLang] = useState(localStorage.getItem("i18nextLng"));

    const handleLogout = () => {
        sessionStorage.removeItem("token")
        window.location.reload()
    }

    const handleChange = e => {
        localStorage.setItem("i18nextLng", e.target.value)
        setLang(e.target.value);
        let loc = "http://localhost:3000/settings";
        // window.location.reload(true)
        window.location.replace(loc + "?lng=" + e.target.value);
    }

    function displayShortFacilityLogo() {
        return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
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
        var tempLang = localStorage.getItem("i18nextLng")
        if(tempLang === ""){
            localStorage.setItem("i18nextLng", "en")
        } else if(tempLang === "en-US") {
            localStorage.setItem("i18nextLng", "en")
        }
        setLang(localStorage.getItem("i18nextLng"))

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
        swal("Translations", "Translations from Polish to English and German available only in:\n-login page\n-manage users page"+
        "\n-revocer password page\n-main page\n-add user page\n-list of users page\n-edit user page\n-settings page\nOn other pages only Polish is available" , "warning")
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <div className={styles.one_element}>
                    <div className={styles.label}>{t("settings:chooseLanguage")}</div>
                    <select value={lang} onChange={handleChange} className={styles.radio_input}>
                        {languages.map((entry, key) => (
                            entry.value === lang ?
                                <option checked value={entry.value}>{entry.text}</option>
                                :
                                <option value={entry.value}>{entry.text}</option>
                        ))}
                    </select>
                </div >
            </div>
        </div >
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
            {console.log(lang)}
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
                <div className={styles.element_group}>
                    <div className={styles.navbar}>
                        <div className={styles.navbar_left}>
                            <Link to="/">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            {t("settings:pageName")}
                        </div>
                        <div className={styles.navbar_right}>
                            <button type="button" onClick={handleLogout} className={styles.navbar_button}>
                                <BsBoxArrowLeft />
                            </button>
                            <Link to="/myAccount" className={styles.navbar_button}>
                                <BsPersonCircle />
                            </Link>
                        </div>
                    </div>
                    {displayContent()}
                </div>
            }
            {displayRole()}
        </div>
    )
}
export default Settings