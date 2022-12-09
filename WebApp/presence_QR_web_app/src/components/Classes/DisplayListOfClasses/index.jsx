import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs";

const DisplayListOfClasses = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState();
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("");
    const [facilityID, setFacilityID] = useState("");

    const [allGroups, setAllGroups] = useState([]);
    const [allClassrooms, setAllClassrooms] = useState([]);
    const [allLecturers, setAllLecturers] = useState([]);

    const [groupIDForSearch, setGroupIDForSearch] = useState("");
    const [classroomIDForSearch, setClassroomIDForSearch] = useState("");
    const [lecturerIDForSearch, setLecturerIDForSearch] = useState("");

    const [classes, setClasses] = useState([]);

    const [error,] = useState("");

    const { t } = useTranslation();
    const config = {
        headers: { Authorization: `${sessionStorage.getItem("token")}` }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        window.location.reload();
    };

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split(".")[1]));
        } catch (e) {
            return null;
        }
    };

    function displayShortFacilityLogo() {
        return (
            <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
        );
    }

    async function handleSearch(event) {
        setClasses([])
        const searchUsers = async () => {
            var dataToSend = {
                facility_id: facilityID,
                group_id: groupIDForSearch,
                classroom_id: classroomIDForSearch,
                lecturer_id: lecturerIDForSearch,
            };
            var res
            try {
                console.log(dataToSend);
                var url = 'http://localhost:8080/classes/searchClasses/'
                res = await axios.post(url, dataToSend, config)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            res = res.data
            for (var i = 0; i < res.length; i++) {
                var dayName = ""
                switch (res[i].day_of_week) {
                    case 0: dayName = "Niedziela"; break;
                    case 1: dayName = "Poniedziałek"; break;
                    case 2: dayName = "Wtorek"; break;
                    case 3: dayName = "Środa"; break;
                    case 4: dayName = "Czwartek"; break;
                    case 5: dayName = "Piątek"; break;
                    default: dayName = "Sobota"; break;
                }
                res[i].day_of_week = dayName
            }
            setClasses(res)
            console.log(res)
        };
        event.preventDefault();
        await searchUsers();
    }

    useEffect(() => {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"));
        setRole(decodedJWT.user_role);

        //fetch facility data:
        const fetchAndSetFacilityLogo = async () => {
            try {
                var dataToSend = { id: decodedJWT.facility_id };
                var url = "http://localhost:8080/facilities/getOneFacilityDataByID/";
                const { data: res } = await axios.post(url, dataToSend, config);
                setFacilityShortLogoLink("http://localhost:8080/logos/" + res[0].facility_logo + "_short.png");
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setFacilityID(decodedJWT.facility_id);
        };
        fetchAndSetFacilityLogo();

        //fetch and set all groups:
        const fetchAndSetAllGroups = async () => {
            try {
                var dataToSend = { id: decodedJWT.facility_id };
                var url = "http://localhost:8080/groups/getAllGroupsFromFacility/";
                const { data: res } = await axios.post(url, dataToSend, config);
                setAllGroups(res);
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        };
        fetchAndSetAllGroups();

        //fetch and set all classrooms:
        const fetchAndSetAllClassrooms = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id };
                var url = "http://localhost:8080/classrooms/getAllClassroomsFromFacility/";
                const { data: res } = await axios.post(url, dataToSend, config);
                setAllClassrooms(res);
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        };
        fetchAndSetAllClassrooms();

        //fetch and set all lecturers:
        const fetchAndSetAllLecturers = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id };
                var url = "http://localhost:8080/users/getAllLecturersFromFacility/";
                const { data: res } = await axios.post(url, dataToSend, config);
                setAllLecturers(res);
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        };
        fetchAndSetAllLecturers();
    }, []);

    function displayContent() {
        return (
            <div className={styles.display_content}>
                <div className={styles.content_box}>
                    <div className={styles.left_side}>
                        <div className={styles.box_title}>Wyszukaj:</div>
                        <form onSubmit={handleSearch}>
                            <div className={styles.box_border_left}>
                                <div className={styles.label}> Wybierz grupę </div>
                                <div className={styles.radio_box}>
                                    <select name="groups" id="groups" className={styles.radio_input} onChange={(e) => setGroupIDForSearch(e.target.value)}>
                                        <option selected value={""}>-- wybierz grupę --</option>
                                        {allGroups.map((entry, key) =>
                                            entry.id !== null ? (
                                                <option value={entry.id}>{entry.group_name}</option>
                                            ) : (
                                                <div>Błąd ładowania grup lub brak grup!</div>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div className={styles.small_text}> Lub / i</div>
                                <div className={styles.label}> Wybierz salę </div>
                                <div className={styles.radio_box}>
                                    <select name="classrooms" id="classroom" className={styles.radio_input} onChange={(e) => setClassroomIDForSearch(e.target.value)}>
                                        <option selected value={""}>-- wybierz salę --</option>
                                        {allClassrooms.map((entry, key) =>
                                            entry.id !== null ? (
                                                <option value={entry.id}>{entry.classroom_name}</option>
                                            ) : (
                                                <div>Błąd ładowania sal lub brak sal!</div>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div className={styles.small_text}> Lub / i</div>
                                <div className={styles.label}> Wybierz prowadzącego </div>
                                <div className={styles.radio_box}>
                                    <select name="groups" id="groups" className={styles.radio_input} onChange={(e) => setLecturerIDForSearch(e.target.value)}>
                                        <option selected value={""}>-- wybierz prowadzącego --</option>
                                        {allLecturers.map((entry, key) =>
                                            entry.id !== null ? (
                                                <option value={entry.id}>{entry.title + " " + entry.first_name + " " + entry.surname}</option>
                                            ) : (
                                                <div>Błąd ładowania prowadzących lub brak prowądzych!</div>
                                            )
                                        )}
                                    </select>
                                </div>
                                <button type="submit" className={styles.search_facility_btn}>
                                    Wyszukaj
                                </button>
                                {error && <div className={styles.error_msg}>{error}</div>}
                            </div>
                        </form>
                    </div>
                    <div className={styles.right_side}>
                        <div className={styles.box_title}>Wyniki:</div>
                        <div className={styles.box_border_right}>
                            {classes.length !== 0 ?
                                classes.map((entry, key) => (
                                    entry.id !== null ?
                                        <div className={styles.one_class_data}>
                                            <div className={styles.data_part_subject}>
                                                <div className={styles.label_inside_right_box}>Nazwa przedmiotu:</div>
                                                {entry.subject_name}
                                            </div>
                                            <div className={styles.data_part}>
                                                <div className={styles.label_inside_right_box}>Sala:</div>
                                                {entry.classroom_name}
                                            </div>
                                            <div className={styles.data_part}>
                                                <div className={styles.label_inside_right_box}>Prowadzący:</div>
                                                {entry.title + " " + entry.first_name + " " + entry.surname}
                                            </div>
                                            <div className={styles.data_part}>
                                                <div className={styles.label_inside_right_box}>Dzień tygodnia:</div>
                                                {entry.day_of_week}
                                            </div>
                                            <div className={styles.data_part}>
                                                <div className={styles.label_inside_right_box}>Grupa:</div>
                                                {entry.group_name}
                                            </div>
                                            <div className={styles.data_part}>
                                                <div className={styles.label_inside_right_box}>Godzina zajęć:</div>
                                                {entry.beginning_time.slice(0, 5) + " - " + entry.ending_time.slice(0, 5)}
                                            </div>
                                            <button className={styles.navigation_btn}>
                                                <Link className={styles.no_underline} to={"/editClasses/" + entry.id}>
                                                    Szczegóły
                                                </Link>
                                            </button>
                                        </div>
                                        :
                                        <div>Brak zajęć!</div>
                                ))
                                :
                                <div className={styles.info}>Wyszukaj zajęcia</div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function displayRole() {
        if (role === 2) {
            return (
                <div className={styles.role_box}>Zalogowano jako manager placówki</div>
            );
        } else {
            return <div>Wystąpił błąd!!</div>;
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
                            <Link to="/manageClassesMenu">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>Lista zajęć</div>
                        <div className={styles.navbar_right}>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className={styles.navbar_button}
                            >
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
    );
};
export default DisplayListOfClasses;
