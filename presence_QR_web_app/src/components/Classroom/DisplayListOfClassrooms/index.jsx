import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const DisplayListOfClasses = () => {
    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")

    const [allClassrooms, setAllClasrooms] = useState([])

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
        }
        fetchAndSetFacilityLogo()

        //fetch and set all classrooms from user's facility:
        const fetchAndSetAllClassroomsFromFacility = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/classrooms/getAllClassroomsFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllClasrooms(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        fetchAndSetAllClassroomsFromFacility()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <div className={styles.result_box}>
                    <div className={styles.box_title}>
                        Wyniki:
                    </div>
                    <div className={styles.box_border}>
                        {
                            allClassrooms.map((entry, key) => (
                                entry.id !== null ?
                                    <div className={styles.one_classroom_data}>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Nazwa sali:</div>
                                            {entry.classroom_name}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Kod QR:</div>
                                            {entry.QR_code}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>GPS:</div>
                                            X:{entry.gps_x}, Y:{entry.gps_y}
                                        </div>
                                        <button className={styles.navigation_btn}>
                                            <Link className={styles.no_underline} to={"/editClassroom/" + entry.id}>
                                                Szczegóły
                                            </Link>
                                        </button>
                                    </div>
                                    :
                                    <div>Brak sal dla tej placówki!</div>
                            ))
                        }
                    </div>
                </div>
            </div>
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
                <div className={styles.element_group}>
                    <div className={styles.navbar}>
                        <div className={styles.navbar_left}>
                            <Link to="/manageClassroomsMenu">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Lista sal
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
                    {displayContent()}
                </div>
            }
            {displayRole()}
        </div>
    )
}
export default DisplayListOfClasses