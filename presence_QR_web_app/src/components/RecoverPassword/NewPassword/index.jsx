import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import styles from "./styles.module.css"
import swal from 'sweetalert'

const RecoverPassword = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [data, setData] = useState({ password: "", passwordRepeat: "" })
    const [error, setError] = useState("")
    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value })
    };
    const [link,] = useState(window.location.href)
    const [isOk, setIsOk] = useState(true)

    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (data.password !== data.passwordRepeat) {
            setError("Hasła nie są takie same!")
        } else {
            setError("")
            const re = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
            const isOk = re.test(data.password);
            if (isOk) {
                var completeLink = window.location.href
                var link = window.location.href.split('/')[4]
                var temp = link.slice(0, 30)
                const diff = (a, b) => a.split(b).join('')
                const id = parseInt(diff(link, temp))

                var dataToSend = { password: data.password, user_id: id, change_pswd_link: completeLink }

                try {
                    const url = "http://localhost:8080/users/newPasswordRecovery/"
                    await axios.post(url, dataToSend)
                    await swal({ title: "Udało się!", text: "Hasło zostało zmienione, możesz się zalogować. Obecny link został wykorzystany", icon: "success" });
                    navigate("/")
                } catch (err) {
                    e.preventDefault()
                    setError("Link do zmiany hasła wygasł")
                    swal("Błąd...", "Operacja zakończona niepowodzeniem! Link do zmiany hasła wygasł", "error");
                    window.location.reload(false)
                }
            } else {
                setError("Hasło jest za słabe!")
            }
        }
    };

    useEffect(() => {
        const data = async () => {
            var last = link.split('/')[4]
            var temp = last.slice(0, 30)
            const diff = (a, b) => a.split(b).join('')
            const id = parseInt(diff(last, temp))
            if (!Number.isNaN(id)) {
                try {
                    var dataToSend = { user_id: id, change_pswd_link: link }
                    const url = "http://localhost:8080/users/checkLink/"
                    await axios.post(url, dataToSend)
                    setIsOk(true)
                } catch (err) {
                    setIsOk(false)
                }
            }
            setLoading(false)
        }
        data()
    }, [])

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
                isOk ?
                    <div className={styles.recover_password_container}>
                        <div className={styles.left}>
                            <form className={styles.form_container}
                                onSubmit={handleSubmit}>
                                <h2>Odzyskiwanie hasła</h2>
                                <div className={styles.instruction}>
                                    Podaj nowe hasło
                                </div>
                                <div className={styles.input_group_size2}>
                                    <div className={styles.label}> Hasło </div>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        name="password"
                                        onChange={handleChange}
                                        value={data.password}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.input_group_size2}>
                                    <div className={styles.label}> Powtórz hasło </div>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        name="passwordRepeat"
                                        onChange={handleChange}
                                        value={data.passwordRepeat}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.input_group_size2}>
                                    <button type="submit"
                                        className={styles.submit_btn}>
                                        Zapisz
                                    </button>
                                </div>
                                {error && <div className={styles.error_msg}>{error}</div>}
                            </form>
                        </div>
                        <div className={styles.right}>
                        </div>
                    </div>
                    :
                    <div className={styles.column}>
                        <h1 className={styles.header_center}><div></div>Nie znaleziono takiej strony</h1>
                        <div className={styles.text_center}>Sprawdź, czy twój link nie wygasł!</div>
                    </div>
            }
        </div>
    )
}
export default RecoverPassword;
