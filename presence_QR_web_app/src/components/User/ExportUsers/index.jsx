import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"
import exportFromJSON from 'export-from-json'

const ExportUsers = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const idArray = useParams().idArray
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [fileType, setFileType] = useState("")
    const [usersNumber, setUsersNumber] = useState("")
    const [usersArray,] = useState([])

    const { t } = useTranslation();
    const config = {
        headers: { Authorization: `${sessionStorage.getItem("token")}` }
    };

    // const usersArray = []
    const [error, setError] = useState("")

    const handleLogout = () => {
        sessionStorage.removeItem("token")
        window.location.reload()
    }

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            setError(e);
        }
    };

    function displayShortFacilityLogo() {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        if (decodedJWT.user_role === 2) {
            return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
        }
    }

    function prepareDataForExport() {
        var expJSON = "["
        for (var i = 0; i < usersArray.length; i++) {
            var obj1 = usersArray[i]
            expJSON += JSON.stringify(obj1) + ","
        }
        expJSON += "]"
        return expJSON
    }

    const downloadFile = ({ data, fileName, fileType }) => {
        // Create a blob with the data we want to download as a file
        const blob = new Blob([data], { type: fileType })
        // Create an anchor element and dispatch a click event on it to trigger a download
        const a = document.createElement('a')
        a.download = fileName
        a.href = window.URL.createObjectURL(blob)
        const clickEvt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        })
        a.dispatchEvent(clickEvt)
        a.remove()
    }

    async function submitExport(e) {
        //if there are any users for export in array:
        if (usersArray[0] !== undefined) {
            var expJSON = prepareDataForExport()
            //export to json:
            if (fileType === "json") {
                downloadFile({
                    data: expJSON,
                    fileName: 'users.json',
                    fileType: 'text/json',
                })
                //export to xml:
            } else if (fileType === "xml") {
                const data = usersArray
                const fileName = "users"
                let fields = [
                    "id",
                    "facility_id",
                    "role_id",
                    "first_name",
                    "second_name",
                    "surname",
                    "e_mail",
                    "hash_password",
                    "avatar",
                    "title",
                    "birth_date"
                ]
                const exportType = 'xml';
                exportFromJSON({ data, fileName, fields, exportType })
                //export to csv:
            } else if (fileType === "csv") {
                var csvData = ""
                const headers = [
                    "id",
                    "facility_id",
                    "role_id",
                    "first_name",
                    "second_name",
                    "surname",
                    "e_mail",
                    "hash_password",
                    "avatar",
                    "title",
                    "birth_date\n"
                ];
                csvData += headers
                for (var i = 0; i < usersArray.length; i++) {
                    var password = []
                    for (var p = 0; p < usersArray[i].hash_password.data.length; p++) {
                        password.push(usersArray[i].hash_password.data[p])
                    }
                    var row = usersArray[i].id + ',' + usersArray[i].facility_id + ',' + usersArray[i].role_id + ',' + usersArray[i].first_name + ',' + usersArray[i].second_name + ',' + usersArray[i].surname + ',[' + password + '],' + usersArray[i].avatar + ',' + usersArray[i].title + ',' + usersArray[i].birth_date + '\n'
                    csvData += row
                }
                downloadFile({
                    data: csvData,
                    fileName: 'users.csv',
                    fileType: 'text/csv',
                })
            } else {
                setError("Został podany niewłaściwy typ pliku!")
            }
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
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        if (decodedJWT.user_role === 2) {
            fetchAndSetFacilityLogo()
        }

        //fetch users data:
        const fetchAndCheckUsersData = async () => {
            var res
            try {
                var dataToSend = { id_array: idArray }
                var url = 'http://localhost:8080/users/getManyUsersDataByID/'
                res = await axios.post(url, dataToSend, config)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            res = res.data
            //if data was received
            if (res.length !== 0) {
                var tempUsersNumber = 0
                for (var i = 0; i < res.length; i++) {
                    //if user making export is admin:
                    if (decodedJWT.user_role === 1) {
                        //verify if all users are facility managers:
                        if (res[i].role_id === 2) {
                            usersArray.push(res[i])
                            tempUsersNumber++
                        } else {
                            setError("One ore more users cannot be exported")
                        }
                        //if user making export is facility manager:
                    } else if (decodedJWT.user_role === 2) {
                        //verify if all users are teachers or students and are from the correct facility::
                        if ((res[i].role_id === 3 || res[i].role_id === 4) && res[i].facility_id === decodedJWT.facility_id) {
                            if (res[i].role_id === 4) {
                                res[i].birth_date = res[i].birth_date.split('T')[0]
                            }
                            usersArray.push(res[i])
                            tempUsersNumber++
                        } else {
                            setError("One ore more users cannot be exported")
                        }
                    } else {
                        setError("User not permitted for making export")
                    }
                }
                setUsersNumber(tempUsersNumber)
            }
            setLoading(false)
        }

        //if there was one or more users found in the DisplayListOfUsers page:
        if (idArray.length !== 0) {
            fetchAndCheckUsersData()
        }

    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <form>
                    <div className={styles.left_side}>
                        <div className={styles.label}> Informacje o eksporcie </div>
                        {role === 1 ?
                            <div>Możesz wyeksportować jedynie użytkowników o roli menadżera placówki. Próba eksportu użytkowników o innej roli zakończy się niepowodzeniem części lub całej operacji </div>
                            : role === 2 ?
                                <div>Możesz wyeksportować użytkowników o roli prowadzącego zajęcia i studenta ze swojej placówki. Próba eksportu użytkowników o innych rolach lub z innych placówek zakończy się niepowodzeniem części lub całej operacji</div>
                                :
                                <div></div>
                        }
                        <div className={styles.one_element}>
                            <div className={styles.label}> Wybierz rozszerzenie </div>
                            <select name="fileType" id="fileType" className={styles.radio_input} onChange={e => setFileType(e.target.value)} required>
                                <option disabled selected value> -- wybierz typ pliku -- </option>
                                <option value="json" >JSON</option>
                                <option value="xml" >XML</option>
                                <option value="csv" >csv</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.right_side}>
                        <div className={styles.label}> Pogląd eksportowanych danych</div>
                        <div className={styles.preview_box}>
                            <div>
                                {
                                    usersArray.map((entry, key) => (
                                        entry.id !== null ?
                                            <div>
                                                <b>Użytkownik nr. {key}</b> Placówka: {entry.facility_id}<br />
                                                Tytuł: {entry.title} Imię: {entry.first_name}<br />
                                                Drugie imię: {entry.second_name}<br />
                                                Nazwisko: {entry.surname}<br />
                                                Email: {entry.e_mail}<br />
                                                Data urodzenia: {entry.birth_date}<br />
                                                Rola: {entry.role_id} Grupa: {entry.group_id}<br />
                                            </div>
                                            :
                                            <div>Nie wczytano pliku!</div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                    {fileType !== "" ?
                        <div>
                            Wyeksportowany plik będzie zawierał dane {usersNumber} użytkowników<br />
                            <button className={styles.export_users_button} type="button" onClick={(e) => { submitExport(e) }}>Eksportuj</button>
                        </div>
                        :
                        <div>Aby wyeksportować użytkowników najpierw wybierz rozszerzenie!</div>
                    }
                    {error !== "" ?
                        <div className={styles.error_msg}>{error}</div> :
                        <div></div>
                    }
                </form>
            </div >
        </div >
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
                <div className={styles.element_group}>
                    <div className={styles.navbar}>
                        <div className={styles.navbar_left}>
                            <Link to="/displayListOfUsers">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Eksport użytkowników
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
export default ExportUsers