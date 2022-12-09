import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"
import XMLParser from 'react-xml-parser'
import Papa from 'papaparse'

const ImportUsers = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")
    const [fileData, setFileData] = useState("")
    const [usersNumber, setUsersNumber] = useState("")
    const [usersArray, setUsersArray] = useState([])
    // const [users, setUsers] = useState()
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
            setError(e);
        }
    };

    function displayShortFacilityLogo() {
        if (role === 2) {
            return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
        }
    }

    async function allUsers() {
        try {
            var url = 'http://localhost:8080/users/allUsers/'
            const { data: res } = await axios.get(url, config)
            return res
        } catch (err) {
            swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
        }
    }

    const readFileContent = async (e) => {
        var allUsersArray = await allUsers()
        if (e.target.files[0].type === "application/json") {
            var isOk = true
            setFileData(e.target.files[0])

            const fileReader = new FileReader();
            fileReader.readAsText(e.target.files[0], "UTF-8");
            var obj
            var amount = 0
            fileReader.onload = e => {
                try {
                    obj = JSON.parse(e.target.result)
                    // setUsersNumber(obj.length)
                    var tempUsersArray = []
                    for (var i = 0; i < obj.length; i++) {
                        isOk = true
                        if (role === 1) {
                            if (obj[i].role_id !== 2) {
                                swal("Błąd...", "Użytkownika " + i + " nie będzie można dodać ponieważ ma inną rolę niż menedżer placówki. Spróbuj zaimportować inny plik", "error");
                                window.location.reload(true);
                            }
                        } else if (role === 2) {
                            if (obj[i].role_id !== 3 && obj[i].role_id !== 4) {
                                swal("Błąd...", "Użytkownika " + i + " nie będzie można dodać ponieważ ma inną rolę niż wykładowca lub student. Spróbuj zaimportować inny plik", "error");
                                window.location.reload(true);
                            }
                            if (obj[i].facility_id !== facilityID) {
                                swal("Błąd...", "Użytkownika " + i + " nie można zaimportować ponieważ nie należy do Twojej placówki. Spróbuj zaimportować inny plik", "error");
                                window.location.reload(true);
                            }
                        }
                        if (obj[i].group_id.length > 3) {
                            obj[i].group_id = obj[i].group_id.splice(0, 3)
                            swal("Błąd...", "Podano za dużo grup dla użytkownika " + i + ". Liczbę grup zmniejszono do trzech. Zweryfikuj poprawność!", "error");
                        }
                        for (var j = 0; j < allUsersArray.length; j++) {
                            if (obj[i].e_mail === allUsersArray[j].e_mail) {
                                swal("Błąd...", "Nie można utworzyć użytkownika o e-mailu " + obj[i].e_mail + ", ponieważ już taki istnieje", "error");
                                isOk = false
                            }
                        }
                        if (isOk) {
                            tempUsersArray.push(obj[i])
                            amount++
                        }
                    }
                    setUsersNumber(amount)
                    setUsersArray(tempUsersArray)
                } catch (e) {
                    setError("Nieprawidłowa zawartość pliku JSON")
                }
            }
        } else if (e.target.files[0].type === "text/xml") {
            setFileData(e.target.files[0])
            isOk = true; amount = 0
            try {
                var fileContent = await e.target.files[0].text()
                var xml = new XMLParser().parseFromString(fileContent).children[0].children
                var tempUsersArray = []
                for (var i = 0; i < xml.length; i++) {
                    isOk = true
                    if (role === 1) {
                        if (xml[i].children[1].value !== 2) {
                            swal("Błąd...", "Użytkownika " + i + " nie będzie można dodać ponieważ ma inną rolę niż menedżer placówki. Spróbuj zaimportować inny plik", "error");
                            window.location.reload(true);
                        }
                    } else if (role === 2) {
                        if (xml[i].children[1].value !== '3' && xml[i].children[1].value !== '4') {
                            swal("Błąd...", "Użytkownika " + i + " nie będzie można dodać ponieważ ma inną rolę niż wykładowca lub student. Spróbuj zaimportować inny plik", "error");
                            window.location.reload(true);
                        }
                        if (xml[i].children[0].value !== facilityID.toString()) {
                            swal("Błąd...", "Użytkownika " + i + " nie można zaimportować ponieważ nie należy do Twojej placówki. Spróbuj zaimportować inny plik", "error");
                            window.location.reload(true);
                        }
                    }
                    //prepare array of groups:
                    var tempGroupArr = []
                    //for every char in group_id string:
                    for (var j = 0; j < xml[i].children[8].value.length; j++) {
                        //if the char is number than convert it to number and add it to group temporary array:
                        if (xml[i].children[8].value[j] !== "[" && xml[i].children[8].value[j] !== "]" && xml[i].children[8].value[j] !== ",") {
                            tempGroupArr.push(Number(xml[i].children[8].value[j]))
                        }
                    }
                    if (tempGroupArr.length > 3) {
                        tempGroupArr = tempGroupArr.splice(0, 3)
                        setError("Podano za dużo grup dla użytkownika " + i + ". Liczbę grup zmniejszono do trzech. Zweryfikuj poprawność!")
                    }

                    for (var k = 0; k < allUsersArray.length; k++) {
                        if (xml[i].children[5].value === allUsersArray[k].e_mail) {
                            swal("Błąd...", "Nie można utworzyć użytkownika o e-mailu " + allUsersArray[k].e_mail + ", ponieważ już taki istnieje", "error");
                            isOk = false
                        }
                    }
                    if (isOk) {
                        amount++
                        tempUsersArray.push({
                            facility_id: xml[i].children[0].value,
                            role_id: xml[i].children[1].value,
                            first_name: xml[i].children[2].value,
                            second_name: xml[i].children[3].value,
                            surname: xml[i].children[4].value,
                            e_mail: xml[i].children[5].value,
                            title: xml[i].children[6].value,
                            birth_date: xml[i].children[7].value,
                            group_id: tempGroupArr
                        })
                    }
                }
                setUsersNumber(amount)
                setUsersArray(tempUsersArray)

            } catch (e) {
                setError("Nieprawidłowa zawartość pliku XML")
            }
        } else if (e.target.files[0].type === "text/csv") {
            amount = 0
            isOk = true
            setFileData(e.target.files[0])
            fileContent = await e.target.files[0].text()
            var results = Papa.parse(fileContent, {
                dynamicTyping: true
            });
            if (results.errors !== "") {
                var csv = results.data
                setUsersNumber(csv.length - 2)
                tempUsersArray = []
                for (i = 1; i < csv.length - 1; i++) {
                    isOk = true
                    if (role === 1) {
                        if (csv[i][1] !== 2) {
                            swal("Błąd...", "Użytkownika " + i + " nie będzie można dodać ponieważ ma inną rolę niż menedżer placówki. Spróbuj zaimportować inny plik", "error");
                            window.location.reload(true);
                        }
                    } else if (role === 2) {
                        if (csv[i][1] !== 3 && csv[i][1] !== 4) {
                            swal("Błąd...", "Użytkownika " + i + " nie będzie można dodać ponieważ ma inną rolę niż wykładowca lub student. Spróbuj zaimportować inny plik", "error");
                            window.location.reload(true);
                        }
                        if (csv[i][0] !== facilityID) {
                            swal("Błąd...", "Użytkownika " + i + " nie można zaimportować ponieważ nie należy do Twojej placówki. Spróbuj zaimportować inny plik", "error");
                            window.location.reload(true);
                        }
                    }
                    //prepare array of groups:
                    tempGroupArr = []
                    //if there is only one group:
                    if (csv[i].length === 9) {
                        tempGroupArr.push(Number(csv[i][8].slice(1, -1)))
                        //if there are more groups then one:
                    } else {
                        for (j = 8; j < csv[i].length; j++) {
                            //add first group id to array:
                            if (j === 8) {
                                tempGroupArr.push(Number(csv[i][j].slice(1)))
                                //add last group id to array:
                            } else if (j === csv[i].length - 1) {
                                tempGroupArr.push(Number(csv[i][j].slice(0, -1)))
                                //add groups id to array that are not in first or last position:
                            } else {
                                tempGroupArr.push(Number(csv[i][j]))
                            }
                        }
                    }
                    if (tempGroupArr.length > 3) {
                        tempGroupArr = tempGroupArr.splice(0, 3)
                        setError("Podano za dużo grup dla użytkownika " + (i - 1) + ". Liczbę grup zmniejszono do trzech. Zweryfikuj poprawność!")
                    }
                    //find nulls and replace them with empty string:
                    for (j = 0; j < csv[i].length; j++) {
                        if (csv[i][j] === null) {
                            csv[i][j] = ""
                        }
                    }
                    for (k = 0; k < allUsersArray.length; k++) {
                        if (csv[i][5] === allUsersArray[k].e_mail) {
                            swal("Błąd...", "Nie można utworzyć użytkownika o e-mailu " + allUsersArray[k].e_mail + ", ponieważ już taki istnieje", "error");
                            isOk = false
                        }
                    }
                    if (isOk) {
                        amount++
                        tempUsersArray.push({
                            facility_id: csv[i][0],
                            role_id: csv[i][1],
                            first_name: csv[i][2],
                            second_name: csv[i][3],
                            surname: csv[i][4],
                            e_mail: csv[i][5],
                            title: csv[i][6],
                            birth_date: csv[i][7],
                            group_id: tempGroupArr
                        })
                    }
                }
                setUsersNumber(amount)
                setUsersArray(tempUsersArray)
            } else {
                setError(results.errors)
            }
        } else {
            setError("Błąd ładowania pliku")
        }
    };

    const submitUsers = async (e) => {
        if (usersArray[0] !== undefined) {
            try {
                const createUser = async () => {
                    try {
                        var url = 'http://localhost:8080/users/createUsers/'
                        await axios.post(url, usersArray, config)
                        await swal({ title: "Udało się!", text: "Użytkownicy zostali pomyślnie utworzeni!", icon: "success" });
                        window.location.reload(true)
                    } catch (err) {
                        swal("Błąd...", "Operacja tworzenia użytkowników zakończona niepowodzeniem!", "error");
                    }
                }
                createUser()
                e.preventDefault()
            } catch (err) {
                setError("Błąd!")
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
                setFacilityID(decodedJWT.facility_id)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }

        if (decodedJWT.user_role === 2) {
            fetchAndSetFacilityLogo()
        } else {
            setLoading(false)
        }


    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <form onSubmit={submitUsers}>
                    <div className={styles.left_side}>
                        <div className={styles.label}> Informacje o pliku </div>
                        {role === 1 ?
                            <div>Możesz zaimportować jedynie użytkowników o roli menadżera placówki. Próba dodania użytkowników o innej roli zakończy się niepowodzeniem całej operacji </div>
                            : role === 2 ?
                                <div>Możesz zaimportować użytkowników o roli prowadzącego zajęcia i studenta ze swojej placówki. Próba dodania użytkowników o innych rolach lub z innych placówek zakończy się niepowodzeniem całej operacji. Student może mieć maks. trzy grupy!</div>
                                :
                                <div></div>
                        }
                        <div className={styles.label}> Akceptowane rozszerzenia </div>
                        JSON<br />XML<br /> csv
                        <div className={styles.label}> Wczytaj plik </div>
                        <input type="file" onChange={readFileContent} className={styles.choose_file} required />
                        <div className={styles.label}> Informacje o wczytanym pliku</div>
                        {fileData !== "" ?
                            <div>Typ: {fileData.type}<br />Nazwa: {fileData.name}<br />Rozmiar: {fileData.size}B</div>
                            :
                            <div></div>

                        }
                    </div>
                    <div className={styles.right_side}>
                        <div className={styles.label}> Pogląd wczytywanych danych</div>
                        <div className={styles.preview_box}>
                            {usersArray[0] !== undefined ?
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
                                                    Data urodzenia: {entry.brith_date}<br />
                                                    Rola: {entry.role_id} Grupa: {entry.group_id.map((entry1, key1) => (key1 !== entry.group_id.length - 1 ? entry1 + ", " : entry1))}<br />
                                                </div>
                                                :
                                                <div>Nie wczytano pliku!</div>
                                        ))
                                    }
                                </div>
                                :
                                <div></div>
                            }
                        </div>
                    </div>
                    {usersNumber !== 0 && fileData !== "" && (fileData.type === "application/json" || fileData.type === "text/xml" || fileData.type === "text/csv") ?
                        <div>
                            Jeżeli zaimportujesz ten plik zostanie dodanych {usersNumber} użytkowników<br />
                            <button className={styles.import_users_button}>Importuj</button>
                        </div>
                        : fileData !== "" && fileData.type !== "application/json" && fileData.type !== "text/csv" && fileData.type !== "text/xml" ?
                            <div>Podany plik ma złe rozszerzenie{setError("Podany plik ma złe rozszerzenie!")}</div>
                            :
                            <div>Aby zaimportować użytkowników najpierw wybierz plik!</div>
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
                            <Link to="/addUser">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Import użytkowników
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
export default ImportUsers