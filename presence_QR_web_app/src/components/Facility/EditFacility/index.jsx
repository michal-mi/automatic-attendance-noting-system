import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill, BsPencil, BsArrowsFullscreen, BsFillTrashFill, BsXCircle } from "react-icons/bs"

const EditFacility = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const facilityID = useParams().id;
    const [facilityName, setFacilityName] = useState("")
    const [allFacilitiesNames, setAllFacilitiesNames] = useState([])
    const [oldFacilityName, setOldFacilityName] = useState("")
    const [facilityLogo, setFacilityLogo] = useState("")
    const [facilityStatus, setFacilityStatus] = useState("")
    const [facilityLogoLink, setFacilityLogoLink] = useState("")
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [role, setRole] = useState()
    const [uploadLogoWindowOpen, setUploadLogoWindowOpen] = useState(false)
    const [logoIsZoomed, setLogoIsZoomed] = useState(null)
    const [uploadShortLogoWindowOpen, setUploadShortLogoWindowOpen] = useState(false)
    const [shortLogoIsZoomed, setShortLogoIsZoomed] = useState(null)
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

    function checkRegexData() {
        let regexName = new RegExp("^.{1,70}$")
        if (!regexName.test(facilityName)) {
            setError("Nazwa placówki jest nieprawidłowa!")
            return false
        } else {
            return true
        }
    }

    const handleSubmit = async (e) => {
        setError("")
        var tempError = ""
        if (facilityName !== oldFacilityName) {
            for (var i = 0; i < allFacilitiesNames.length; i++) {
                //if this classroom name exist:
                if (allFacilitiesNames[i].facility_name === facilityName) {
                    tempError += "Placówka o nazwie " + facilityName + " już istnieje!\n"
                }
            }
        }
        e.preventDefault()
        setError(tempError)

        //changes facility name and status:
        const changeFacilityNameAndStatus = async (e) => {
            try {
                if (checkRegexData()) {
                    let dataToSend = { id: facilityID, facility_name: facilityName, facility_status: facilityStatus }
                    let url = 'http://localhost:8080/facilities/updateFacilityNameAndStatus/'
                    await axios.post(url, dataToSend, config)
                    await swal({ title: "Udało się!", text: "Zapisano zmiany pomyślnie!", icon: "success" });
                    window.location.reload(true)
                }
            } catch (err) {
                swal("Error...", err.response.data, "error");
            }
        }
        if (tempError === "") {
            await changeFacilityNameAndStatus()
        }
        e.preventDefault()
    }

    const uploadLogo = async (e) => {
        //uploads logo to the server:
        const uploadLogoToServer = async () => {
            try {
                let dataToSend = new FormData();
                dataToSend.append('file', e, facilityID);
                var url = 'http://localhost:8080/facilities/updateFacilityLogo/'
                let config = {
                    headers: {
                        'accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.8',
                        'Content-Type': `multipart/form-data; boundary=${dataToSend._boundary}`,
                        'Authorization': `${sessionStorage.getItem("token")}`
                    }
                }
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Operacja dodawania loga przebiegła pomyślnie!", icon: "success" });
            } catch (err) {
                await swal({ title: "Błąd...", text: "Operacja dodawania loga zakończona niepowodzeniem", icon: "error" });
            }
        }
        await uploadLogoToServer()
        window.location.reload(false)
    }

    const uploadShortLogo = async (e) => {
        //uploads short logo to the server:
        const uploadShortLogoToServer = async () => {
            try {
                let dataToSend = new FormData();
                dataToSend.append('file', e, facilityID);
                var url = 'http://localhost:8080/facilities/updateFacilityShortLogo/'
                let config = {
                    headers: {
                        'accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.8',
                        'Content-Type': `multipart/form-data; boundary=${dataToSend._boundary}`,
                        'Authorization': `${sessionStorage.getItem("token")}`
                    }
                }
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Operacja dodawania krókiego loga przebiegła pomyślnie!", icon: "success" });
            } catch (err) {
                await swal({ title: "Błąd...", text: "Operacja dodawania krótkiego loga zakończona niepowodzeniem", icon: "error" });
            }
        }
        await uploadShortLogoToServer()
        window.location.reload(false)
    }

    const deleteLogo = async () => {
        swal({
            title: "Czy na pewno chcesz usunąć loga placówki",
            text: "Logo oraz krótkie logo zostaną bezpowrotnie usunięte",
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
                swal("Anulowano", "Loga nie zostały usunięta", "error");
            }
        });

        const whenDeletationConfirmed = async () => {
            var res1 = true
            var res2 = true
            //changes reference in database (so there is information saved that facility has no logo):
            const deleteLogoReference = async () => {
                try {
                    var dataToSend = { id: facilityID }
                    var url = 'http://localhost:8080/facilities/deleteOneFacilityLogoReferenceByID/'
                    await axios.post(url, dataToSend, config)
                } catch (err) {
                    res1 = err.response.status
                }
            }
            deleteLogoReference()
            //delete image (logo) from server:
            const deleteLogoFromServer = async () => {
                try {
                    var dataToSend = { id: facilityID }
                    var url = 'http://localhost:8080/facilities/deleteOneFacilityLogoByID/'
                    await axios.post(url, dataToSend, config)
                } catch (err) {
                    res2 = err.response.status
                }
            }
            if (res1 === 200) {
                deleteLogoFromServer()
            }
            window.location.reload(false)
            if (res1 === 200 && res2 === 200) {
                await swal({ title: "Udało się!", text: "Loga zostały usunięte pomyślnie!", icon: "success" });
            } else {
                swal("Błąd...", "Operacja usuwania log zakończona niepowodzeniem!", "error");
            }
            window.location.reload(false)
        }
    }

    useEffect(() => {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        setRole(decodedJWT.user_role)
        const getAllFacilitesNames = async () => {
            try {
                var url = 'http://localhost:8080/facilities/getAllFacilitiesNames/'
                const { data: res } = await axios.get(url, config)
                setAllFacilitiesNames(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        getAllFacilitesNames()
        const getFacilityData = async () => {
            try {
                var dataToSend = { id: facilityID }
                var url = 'http://localhost:8080/facilities/getOneFacilityDataByID/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setFacilityName(res[0].facility_name)
                setOldFacilityName(res[0].facility_name)
                setFacilityLogo(res[0].facility_logo)
                setFacilityStatus(res[0].facility_status)
                setLoading(false)
                if (res[0].facility_status === 1) {
                    const statusRadioButton = document.getElementById('operating')
                    statusRadioButton.checked = true
                } else {
                    const statusRadioButton = document.getElementById('notOperating')
                    statusRadioButton.checked = true
                }
                if (res[0].facility_logo !== "") {
                    setFacilityLogoLink('http://localhost:8080/logos/' + res[0].facility_logo + '.png')
                    setFacilityShortLogoLink('http://localhost:8080/logos/' + res[0].facility_logo + '_short.png')
                }
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        getFacilityData()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <div className={styles.box_title}>
                    Edycja placówki
                </div>
                <div className={styles.left_side}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.label}> Nazwa placówki </div>
                        <input
                            type="text"
                            placeholder="Nazwa placówki"
                            name="facilityName"
                            value={facilityName}
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
                        <button type="submit"
                            className={styles.edit_facility_status_name_btn}>
                            Zatwierdź zmianę nazwy / statusu
                        </button>
                        {error && <div className={styles.error_msg}>{error}</div>}
                    </form>
                </div>
                <div className={styles.right_side}>
                    <div className={styles.label}> Logo placówki </div>
                    <div className={styles.avatar_box} >
                        <img src={facilityLogoLink} className={styles.avatar} alt="facility logo" />
                        <div className={styles.avatar_icon1} onClick={() => {
                            setUploadLogoWindowOpen(true)
                        }}>
                            <BsPencil size={22} strokeWidth={1} />
                            <div className={styles.circle1} />
                        </div>
                        <div className={styles.avatar_icon2} onClick={() => {
                            setLogoIsZoomed(true)
                        }}>
                            <BsArrowsFullscreen size={22} strokeWidth={1} />
                            <div className={styles.circle2} />
                        </div>
                    </div>

                    <div className={styles.label}> Krótkie logo placówki </div>
                    <div className={styles.avatar_box} >
                        <img src={facilityShortLogoLink} className={styles.avatar} alt="short facility logo" />
                        <div className={styles.avatar_icon1} onClick={() => {
                            setUploadShortLogoWindowOpen(true)
                        }}>
                            <BsPencil size={22} strokeWidth={1} />
                            <div className={styles.circle1} />
                        </div>
                        <div className={styles.avatar_icon2} onClick={() => {
                            setShortLogoIsZoomed(true)
                        }}>
                            <BsArrowsFullscreen size={22} strokeWidth={1} />
                            <div className={styles.circle2} />
                        </div>
                    </div>
                </div>
                {uploadLogoWindowOpen ?
                    <div className={styles.modal}>
                        <div className={styles.modal_info}> Wybierz nowe logo placówki</div>
                        <div className={styles.close_modal_button} onClick={() => {
                            setUploadLogoWindowOpen(false)
                        }}>
                            <BsXCircle size={27} strokeWidth={1} />
                        </div>
                        <input encType="multipart/form-data" type="file" name="myImage" onChange={(event) => { uploadLogo(event.target.files[0]) }} className={styles.modal_content} />
                        {facilityLogo !== "" ?
                            <div className={styles.close_modal_button} onClick={() => {
                                deleteLogo()
                                setUploadLogoWindowOpen(false)
                            }}>
                                <BsFillTrashFill size={27} />
                            </div>
                            :
                            <div></div>
                        }
                    </div>
                    :
                    <div></div>
                }
                {logoIsZoomed ?
                    <div className={styles.modal}>
                        <div className={styles.close_modal_button} onClick={() => {
                            setLogoIsZoomed(false)
                        }}>
                            <BsXCircle size={27} strokeWidth={1} />
                        </div>
                        <img src={facilityLogoLink} alt="facility logo" className={styles.modal_content} />
                    </div>
                    :
                    <div></div>
                }
                {uploadShortLogoWindowOpen ?
                    <div className={styles.modal}>
                        <div className={styles.modal_info}> Wybierz nowe krótkie logo placówki</div>
                        <div className={styles.close_modal_button} onClick={() => {
                            setUploadShortLogoWindowOpen(false)
                        }}>
                            <BsXCircle size={27} strokeWidth={1} />
                        </div>
                        <input encType="multipart/form-data" type="file" name="myImage" onChange={(event) => { uploadShortLogo(event.target.files[0]) }} className={styles.modal_content} />
                        {facilityLogo !== "" ?
                            <div className={styles.close_modal_button} onClick={() => {
                                deleteLogo()
                                setUploadShortLogoWindowOpen(false)
                            }}>
                                <BsFillTrashFill size={27} />
                            </div>
                            :
                            <div></div>
                        }
                    </div>
                    :
                    <div></div>
                }
                {shortLogoIsZoomed ?
                    <div className={styles.modal}>
                        <div className={styles.close_modal_button} onClick={() => {
                            setShortLogoIsZoomed(false)
                        }}>
                            <BsXCircle size={27} strokeWidth={1} />
                        </div>
                        <img src={facilityShortLogoLink} alt="short facility logo" className={styles.modal_content} />
                    </div>
                    :
                    <div></div>
                }
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
                            <Link to="/displayListOfFacilities">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                        </div>
                        <div className={styles.navbar_center}>
                            Szczegóły / edycja placówki
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
export default EditFacility