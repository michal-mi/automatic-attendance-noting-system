import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import styles from "./styles.module.css"

const RecoverPassword = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [data, setData] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const { t } = useTranslation();
    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value })
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            var dataToSend = { email: data.email }
            const url = "http://localhost:8080/users/initiatePasswordChange/"
            const { data: res } = await axios.post(url, dataToSend)

            if (res) {
                await swal({ title: "Email send!", text: "If account linked to provided email exists in the system link to recover password was send", icon: "success" });
                window.location.reload(false)
            } else {
                swal("Error...", "Operation failed!", "error");
            }
        } catch (error) {
            if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ) {
                setError(error.response.data.message)
            }
        }
    };

    useEffect(() => {
        sleep(2000)
        if (localStorage.getItem("i18nextLng") === "en-US") {
            localStorage.setItem("i18nextLng", "en")
        }
        setLoading(false)
    }, []);

    const sleep = async (milliseconds) => {
        return await new Promise(resolve => setTimeout(resolve, milliseconds))
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
                <div className={styles.recover_password_container}>
                    <div className={styles.left}>
                        <form className={styles.form_container}
                            onSubmit={handleSubmit}>
                            <h2>{t("passwordRecovery:pageName")}</h2>
                            <div className={styles.instruction}>
                            {t("passwordRecovery:info")}
                            </div>
                            <div className={styles.input_group_size2}>
                                <div className={styles.label}>{t("passwordRecovery:emailLabel")}</div>
                                <input
                                    type="email"
                                    placeholder={t("passwordRecovery:emailPlaceholder")}
                                    name="email"
                                    onChange={handleChange}
                                    value={data.email}
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.input_group_size2}>
                                <button type="submit"
                                    className={styles.submit_btn}>
                                    {t("passwordRecovery:recoverPasswordButton")}
                                </button>
                            </div>
                            <div className={styles.input_group_size2}>
                                <Link to="/login">
                                    <button type="button"
                                        className={styles.recover_password_btn}>
                                        {t("passwordRecovery:returnButton")}
                                    </button>
                                </Link>
                            </div>
                            {error && <div className={styles.error_msg}>{error}</div>}
                        </form>
                    </div>
                    <div className={styles.right}>
                    </div>
                </div>
            }
        </div>
    )
}
export default RecoverPassword;
