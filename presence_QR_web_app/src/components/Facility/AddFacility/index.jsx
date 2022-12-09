import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const AddFacility = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [allFacilitiesNames, setAllFacilitiesNames] = useState([])
    const [facilityName, setFacilityName] = useState("")
    const [facilityStatus, setFacilityStatus] = useState("")
    const [facilityID, setFacilityID] = useState("")
    const [logo, setLogo] = useState("")
    const [shortLogo, setShortLogo] = useState("")
    const [error, setError] = useState("")

    const { t } = useTranslation();
    const configAuth = {
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

    function checkRegexData() {
        let regexName = new RegExp("^.{1,70}$")
        if(!regexName.test(facilityName)) {
            setError("Nazwa placówki jest nieprawidłowa!")
            return false
        } else {
            return true
        }
    }

    const handleSubmit = async (e) => {
        var tempError = ""
        for (var i = 0; i < allFacilitiesNames.length; i++) {
            //if this classroom name exist:
            if (allFacilitiesNames[i].facility_name === facilityName) {
                tempError += "Placówka o nazwie " + facilityName + " już istnieje!\n"
            }
        }

        setError("")
        var logoReference = ""
        var logosSetCorrectly = true
        if (logo !== "" && shortLogo !== "") {
            logoReference = facilityID
        } else if (logo !== "" || shortLogo !== "") {
            e.preventDefault()
            tempError += "Oba loga muszą być ustawione lub żadne logo nie może być ustawione!"
            logosSetCorrectly = false
            e.preventDefault()
        }
        e.preventDefault()
        setError(tempError)
        e.preventDefault()

        if (tempError === "") {
            //create facility in facility entity:
            const createFacility = async () => {
                try {
                    if(checkRegexData()) {
                        let dataToSend = { facility_name: facilityName, facility_status: facilityStatus, facility_logo: logoReference }
                        console.log(dataToSend)
                        var url = 'http://localhost:8080/facilities/createNewFacility/'
                        await axios.post(url, dataToSend, configAuth)
                        return true
                    }
                } catch (err) {
                    swal("Error...", err.response.data, "error");
                    return false
                }
            }

            //uploads logo and short logo to the server:
            const uploadLogoToServer = async () => {
                try {
                    let dataToSend = new FormData();
                    dataToSend.append('file', logo, facilityID);
                    let url = 'http://localhost:8080/facilities/updateFacilityLogo/'
                    let config = {
                        headers: {
                            'accept': 'application/json',
                            'Accept-Language': 'en-US,en;q=0.8',
                            'Content-Type': `multipart/form-data; boundary=${dataToSend._boundary}`,
                            'Authorization': `${sessionStorage.getItem("token")}`
                        }
                    }
                    await axios.post(url, dataToSend, config)
                    return true
                } catch (err) {
                    return false
                }
            }

            const uploadShortLogoToServer = async () => {
                try {
                    let dataToSend = new FormData();
                    dataToSend.append('file', shortLogo, facilityID);
                    let url = 'http://localhost:8080/facilities/updateFacilityShortLogo/'
                    let config = {
                        headers: {
                            'accept': 'application/json',
                            'Accept-Language': 'en-US,en;q=0.8',
                            'Content-Type': `multipart/form-data; boundary=${dataToSend._boundary}`,
                            'Authorization': `${sessionStorage.getItem("token")}`
                        }
                    }
                    await axios.post(url, dataToSend, config)
                    return true
                } catch (err) {
                    return false
                }
            }
            var res1, res2=true, res3=true
            if (logosSetCorrectly) {
                res1 = await createFacility() 
                if (logoReference !== "") {
                    if(res1){
                        res2 = uploadLogoToServer()
                        res3 = uploadShortLogoToServer()
                    }
                }
            }
            if (res1 && res2 && res3 && logosSetCorrectly) {
                await swal({ title: "Udało się!", text: "Operacja tworzenia placówki przebiegła pomyślnie!", icon: "success" });
                window.location.reload(true)
            } 
        }
    }

    useEffect(() => {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        setRole(decodedJWT.user_role)
        const getID = async () => {
            try {
                var url = 'http://localhost:8080/facilities/getLastFacilityID/'
                const { data: res } = await axios.get(url, configAuth)
                let highestID = res[0].id
                let newFacilityID = highestID + 1
                setFacilityID(newFacilityID)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        getID()

        const getAllFacilitesNames = async () => {
            try {
                var url = 'http://localhost:8080/facilities/getAllFacilitiesNames/'
                const { data: res } = await axios.get(url, configAuth)
                setAllFacilitiesNames(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        getAllFacilitesNames()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <div className={styles.box_title}>
                    Kreator placówki
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.left_side}>
                        <div className={styles.label}> Nazwa placówki </div>
                        <input
                            type="text"
                            placeholder="Nazwa placówki"
                            name="facilityName"
                            onChange={e => setFacilityName(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <div className={styles.label}> Status placówki </div>
                        <div className={styles.radio_box}>
                            <div className={styles.radio_input}>
                                <input type="radio" id="operating" name="facilityStatus" value='1' onChange={e => setFacilityStatus(e.target.value)} required />
                                <label for="operating">Funkcjonująca</label>
                            </div>
                            <div className={styles.radio_input}>
                                <input type="radio" id="notOperating" name="facilityStatus" value='0' onChange={e => setFacilityStatus(e.target.value)} />
                                <label for="notOperating">Niefunkcjonująca</label>
                            </div>
                        </div>
                    </div>
                    <div className={styles.right_side}>
                        <div className={styles.label}> Logo placówki </div>
                        <input encType="multipart/form-data" type="file" name="myImage" onChange={e => setLogo(e.target.files[0])} className={styles.upload_logo} />
                        <div className={styles.label}> Krótkie logo placówki </div>
                        <input encType="multipart/form-data" type="file" name="myImage" onChange={e => setShortLogo(e.target.files[0])} className={styles.upload_logo} />
                    </div>
                    <button type="submit"
                        className={styles.create_facility_btn}>
                        Utwórz
                    </button>
                    {error && <div className={styles.error_msg}>{error}</div>}
                </form>
            </div>
        </div>
    }

    function displayRole() {
        if (role === 1) {
            return <div className={styles.role_box}>Zalogowano jako administrator</div>
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
                            <Link to="/manageFacilitiesMenu">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                        </div>
                        <div className={styles.navbar_center}>
                            Dodaj placówkę
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
export default AddFacility