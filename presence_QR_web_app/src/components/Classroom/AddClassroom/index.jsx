import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs";

const AddClassroom = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")

    //stores all classes to check when creating a class if such a class does not yet exists:
    const [allClassrooms, setAllClasrooms] = useState("")

    //stores all values ​​from the form:
    const [classroomName, setClassroomName] = useState("")
    const [classroomGPSx, setClassroomGPSx] = useState("")
    const [classroomGPSy, setClassroomGPSy] = useState("")
    const [classroomDescription, setClassroomDescription] = useState("")

    const [error, setError] = useState("")

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

    function checkRegexData() {
        let regexGps = new RegExp("^[0-9]{1,3}\.[0-9]{5}$")
        let regexName = new RegExp("^.{1,15}$")
        let regexDescription = new RegExp("^.{0,1000}$")

        switch(true) {
            case (!regexName.test(classroomName)):
                setError("Nazwa sali jest nieprawidłowa!")
                return false
            case (!regexGps.test(classroomGPSx)):
                setError("Współrzędna GPS x jest nieprawidłowa!")
                return false
            case (!regexGps.test(classroomGPSy)):
                setError("Współrzędna GPS y jest nieprawidłowa!")
                return false
            case (!regexDescription.test(classroomDescription)):
                setError("Opis sali jest nieprawidłowy!")
                return false
            default:
                return true
        }
    }


    // async function handleSubmit(event) {
    const handleSubmit = async (e) => {
        setError("")
        var tempError = ""
        for (var i = 0; i < allClassrooms.length; i++) {
            //if this classroom name exist:
            if (allClassrooms[i].classroom_name === classroomName) {
                tempError += "Sala o nazwie " + classroomName + " już istnieje!\n"
            }
        }
        e.preventDefault()
        setError(tempError)

        if (tempError === "") {
            setError("")
            //create classroom in classroom entity:
            const createClassroom = async () => {
                try {
                    if(checkRegexData()) {
                        let dataToSend = { classroom_name: classroomName, facility_id: facilityID, classroom_description: classroomDescription, gps_x: classroomGPSx, gps_y: classroomGPSy }
                        var url = 'http://localhost:8080/classrooms/createClassroom/'
                        await axios.post(url, dataToSend, config)
                        await swal({ title: "Udało się!", text: "Operacja tworzenia sali przebiegła pomyślnie!", icon: "success" });
                        window.location.reload(true)
                    }
                } catch (err) {
                    swal("Error...", err.response.data, "error")
                }
            }
            createClassroom()
            e.preventDefault()
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
                setFacilityID(decodedJWT.facility_id)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetFacilityLogo()

        //fetch all classrooms from facility:
        const fetchAndSetAllClassrooms = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/classrooms/getAllClassroomsNamesFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllClasrooms(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        fetchAndSetAllClassrooms()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <form onSubmit={handleSubmit}>
                    <table>
                        <tr className={styles.one_line}>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Nazwa sali* </div>
                                <input
                                    value={classroomName}
                                    type="text"
                                    placeholder="Nazwa sali"
                                    name="classroomName"
                                    onChange={e => setClassroomName(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </td>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Współrzędna GPS x* </div>
                                <input
                                    type="text"
                                    placeholder="Współrzędna GPS x"
                                    name="classroomGPSx"
                                    onChange={e => setClassroomGPSx(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </td>
                            <td className={styles.one_element} rowSpan="2">
                                <div className={styles.label}> Opis sali </div>
                                <textarea
                                    type="text"
                                    placeholder="Opis sali"
                                    name="classroomDescription"
                                    onChange={e => setClassroomDescription(e.target.value)}
                                    className={styles.description_input}
                                />
                            </td>
                        </tr>
                        <tr className={styles.one_line}>
                            <td></td>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Współrzędna GPS y* </div>
                                <input
                                    type="text"
                                    placeholder="Współrzędna GPS y"
                                    name="classroomGPSy"
                                    onChange={e => setClassroomGPSy(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </td>
                        </tr>
                        <tr className={styles.one_line}>
                            <td></td>
                            <td className={styles.one_element}>
                                <button type="submit"
                                    className={styles.create_classroom_btn}>
                                    Utwórz
                                </button>
                            </td>
                            <td className={styles.one_element}>
                                {error && <div className={styles.error_msg}>{error}</div>}
                            </td>
                        </tr>
                    </table>
                </form>
            </div >
        </div >
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
                            Dodawanie sali
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
export default AddClassroom