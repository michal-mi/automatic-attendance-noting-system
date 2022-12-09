import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"
import QRCode from "easyqrcodejs"
import { toPng } from "html-to-image"
import jsPDF from "jspdf"

const EditClassroom = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const classroomID = Number(useParams().id);
    const [role, setRole] = useState()
    const [facilityID, setFacilityID] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")

    //stores all classes to check when creating a class if such a class does not exist anymore:
    const [allClassrooms, setAllClasrooms] = useState("")

    //stores all values ​​from the form:
    const [classroomName, setClassroomName] = useState("")
    const [classroomOldName, setClassroomOldName] = useState("")
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

    async function deleteClassroom() {
        swal({
            title: "Czy na pewno chcesz usunąć tą salę?",
            text: "Wraz z salą zostaną usunięte wszystkie prowadzone w niej zajęcia wraz z obecnościami!",
            icon: "warning",
            buttons: [
                'Anuluj',
                'Zatwierdź'
            ],
            dangerMode: true,
        }).then(function (isConfirm) {
            if (isConfirm) {
                whenDeletationConfirmed()
            } else {
                swal("Anulowano", "Sala nie została usunięta", "error");
            }
        });

        const whenDeletationConfirmed = async () => {
            try {
                let dataToSend = { id: classroomID}
                var url = 'http://localhost:8080/classrooms/deleteOneClassroom/'
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Sala została usunięta pomyślnie!", icon: "success" });
                window.location.replace("http://localhost:3000/displayListOfClassrooms");
            } catch (err) {
                swal("Błąd...", "Operacja usuwania sali zakończona niepowodzeniem!", "error");
            }
        }
    }

    async function deleteClassroomNoCascade() {
        swal({
            title: "Czy na pewno chcesz usunąć tą salę?",
            text: "Operacja będzie nieodwracalna!\nNie zostaną usunięte zajęcia ani obecności\nPamiętaj aby później przypisać zajęcia pozostające bez sali do nowej sali!",
            icon: "warning",
            buttons: [
                'Anuluj',
                'Zatwierdź'
            ],
            dangerMode: true,
        }).then(function (isConfirm) {
            if (isConfirm) {
                whenDeletationConfirmed()
            } else {
                swal("Anulowano", "Sala nie została usunięta", "error");
            }
        });

        const whenDeletationConfirmed = async () => {
            try {
                let dataToSend = { id: classroomID, facility_id: facilityID  }
                var url = 'http://localhost:8080/classrooms/deleteOneClassroomNoCascade/'
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Sala została usunięta pomyślnie!", icon: "success" });
                window.location.replace("http://localhost:3000/displayListOfClassrooms");
            } catch (err) {
                swal("Błąd...", "Operacja usuwania sali zakończona niepowodzeniem!", "error");
            }
        }
    }

    function checkRegexData() {
        let regexGps = new RegExp("^[0-9]{1,3}\.[0-9]{5}$")
        let regexName = new RegExp("^.{1,15}$")
        let regexDescription = new RegExp("^.{0,1000}$")

        switch (true) {
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

    async function handleSubmit(event) {
        setError("")
        var tempError = ""
        if (classroomName !== classroomOldName) {
            for (var i = 0; i < allClassrooms.length; i++) {
                //if this classroom name exist:
                if (allClassrooms[i].classroom_name === classroomName) {
                    tempError += "Sala o nazwie " + classroomName + " już istnieje!\n"
                }
            }
        }
        event.preventDefault()
        setError(tempError)

        //changes facility name and status:
        const changeClassroomData = async () => {
            try {
                if (checkRegexData()) {
                    let dataToSend = { id: classroomID, classroom_name: classroomName, facility_id: facilityID, classroom_description: classroomDescription, gps_x: classroomGPSx, gps_y: classroomGPSy }
                    let url = 'http://localhost:8080/classrooms/updateOneClassroom/'
                    await axios.post(url, dataToSend, config)
                    await swal({ title: "Udało się!", text: "Operacja zmiany danych sali przebiegła pomyślnie!", icon: "success" });
                    window.location.reload(true)
                }
            } catch (err) {
                swal("Error...", err.response.data, "error")
            }
        }
        if (tempError === "") {
            await changeClassroomData()
        }
        event.preventDefault()
    }

    //this function generates qr code and places it in div  with id qrcode
    const makeQR = (code, name) => {
        var options = {
            //set qr code - size:
            width: 320,
            height: 290,
            text: code, //set qr code data
            //set qr code titles:
            title: "Kod: " + code,
            titleFont: "normal normal bold 24px Arial",
            titleColor: "#004284",
            titleBackgroundColor: "#fff",
            titleHeight: 45,
            titleTop: 18,
            subTitle: "Sala: " + name,
            subTitleFont: "normal normal normal 20px Arial",
            subTitleColor: "#004284",
            subTitleTop: 40,
        }

        // var element = document.createElement("a");
        document.getElementById("qrcode").innerHTML = "";
        var qrc = new QRCode("qrcode", options)
        console.log(qrc)
    }

    //this function creates png from qrcode and downloades it to user computer:
    const printQRCode = async () => {

        // assign qr code to const:
        const dataUrl = await toPng(document.getElementById("qr_box"));

        var doc = new jsPDF();
        doc.addImage(dataUrl, "png", 10, 10, 125, 125)
        doc.save(classroomName + "_code.pdf")
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
        }
        fetchAndSetAllClassrooms()

        //get classroom data:
        const getClassroomData = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id, id: classroomID }
                var url = 'http://localhost:8080/classrooms/getOneClassroom/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setClassroomName(res[0].classroom_name)
                setClassroomOldName(res[0].classroom_name)
                setLoading(false)
                makeQR(res[0].QR_code, res[0].classroom_name) //generates QRcode
                setClassroomGPSx(res[0].gps_x)
                setClassroomGPSy(res[0].gps_y)
                setClassroomDescription(res[0].classroom_description)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        getClassroomData()
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
                                    type="text"
                                    placeholder="Nazwa sali"
                                    name="classroomName"
                                    value={classroomName}
                                    onChange={e => setClassroomName(e.target.value)}
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
                                    value={classroomDescription}
                                    onChange={e => setClassroomDescription(e.target.value)}
                                    className={styles.description_input}
                                />
                            </td>
                            <td className={styles.one_element} rowSpan="3">
                                <div className={styles.label}> Kod QR </div>
                                <div className={styles.qr_box} id="qr_box">
                                    <div id="qrcode"></div>
                                </div>
                                <button type="button" className={styles.print_btn} onClick={e => printQRCode(e)}>
                                    Drukuj kod QR
                                </button>
                            </td>
                        </tr>
                        <tr className={styles.one_line}>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Współrzędna GPS x* </div>
                                <input
                                    type="text"
                                    placeholder="Współrzędna GPS x"
                                    name="classroomGPSx"
                                    value={classroomGPSx}
                                    onChange={e => setClassroomGPSx(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </td>
                            <td></td>
                        </tr>
                        <tr className={styles.one_line}>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Współrzędna GPS y* </div>
                                <input
                                    type="text"
                                    placeholder="Współrzędna GPS y"
                                    name="classroomGPSy"
                                    value={classroomGPSy}
                                    onChange={e => setClassroomGPSy(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </td>
                            <td></td>
                        </tr>
                        <tr className={styles.one_line}>
                            <td className={styles.one_element}>
                                {error && <div className={styles.error_msg}>{error}</div>}
                            </td>
                            <td className={styles.one_element}>
                                <button type="submit" className={styles.save_changes_btn}>
                                    Zapisz zmiany
                                </button>
                            </td>
                            <td className={styles.one_element}>
                                <button type="button" className={styles.delete_classroom_btn} onClick={e => deleteClassroom(e)}>
                                    Usuń salę kaskadowo
                                </button>
                                <button type="button" className={styles.delete_classroom_btn} onClick={e => deleteClassroomNoCascade(e)}>
                                    Usuń salę bezpiecznie
                                </button>
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
                            <Link to="/displayListOfClassrooms">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Szczegóły / edycja sali
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
export default EditClassroom