import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const AddSubject = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")

    //stores all subjects to check when creating a subject if such a subject does not exist yet:
    const [allSubjects, setAllSubjects] = useState("")

    //stores all values ​​from the form:
    const [subjectName, setSubjectName] = useState("")
    const [subjectYear, setSubjectYear] = useState("")
    const [subjectSemester, setSubjectSemester] = useState("")

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
        let regexName = new RegExp("^.{1,70}$")
        let regexYear = new RegExp("^[1-9]{1}$")
        let regexSemester = new RegExp("^[1-9]{1}[0-9]?$")

        switch (true) {
            case (!regexName.test(subjectName)):
                setError("Nazwa przedmiotu jest nieprawidłowe!")
                return false
            case (!regexYear.test(subjectYear)):
                setError("Rok jest nieprawidłowy!")
                return false
            case (!regexSemester.test(subjectSemester)):
                setError("Semestr jest nieprawidłowy!")
                return false
            default:
                return true
        }
    }

    // async function handleSubmit(event) {
    const handleSubmit = async (e) => {
        setError("")

        var tempError = ""
        for (var i = 0; i < allSubjects.length; i++) {
            //if this classroom name exist:
            if (allSubjects[i].subject_name === subjectName) {
                tempError += "Przedmiot o nazwie " + subjectName + " już istnieje!\n"
            }
        }
        e.preventDefault()
        setError(tempError)

        if (tempError === "") {
            setError("")
            //create subject in subject entity:
            const createSubject = async () => {
                try {
                    if (checkRegexData()) {
                        let dataToSend = { facility_id: facilityID, subject_name: subjectName, year: subjectYear, semester: subjectSemester }
                        var url = 'http://localhost:8080/subjects/createSubject/'
                        await axios.post(url, dataToSend, config)
                        await swal({ title: "Udało się!", text: "Przedmiot został utworzony", icon: "success" })
                        window.location.reload(true)
                    }
                } catch (err) {
                    swal("Error...", err.response.data, "error")
                }
            }
            createSubject()
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

        //fetch all subjects from facility:
        const fetchAndSetAllSubjects = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/subjects/getAllSubjectsNamesFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllSubjects(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        fetchAndSetAllSubjects()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.one_element}>
                        <div className={styles.label}> Nazwa przedmiotu* </div>
                        <input
                            value={subjectName}
                            type="text"
                            placeholder="Nazwa przedmiotu"
                            name="subjectName"
                            onChange={e => setSubjectName(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.one_element}>
                        <div className={styles.label}> Rok* </div>
                        <input
                            type="number"
                            placeholder="Rok"
                            name="subjectYear"
                            onChange={e => setSubjectYear(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div cclassName={styles.one_element}>
                        <div className={styles.label}> Semester* </div>
                        <input
                            type="number"
                            placeholder="Semestr"
                            name="subjectSemester"
                            onChange={e => setSubjectSemester(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.one_element}>
                        <button type="submit"
                            className={styles.create_subject_btn}>
                            Utwórz
                        </button>
                    </div>
                    <div className={styles.one_element}>
                        {error && <div className={styles.error_msg}>{error}</div>}
                    </div>
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
                            <Link to="/manageSubjectsMenu">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Dodawanie przedmiotu
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
export default AddSubject