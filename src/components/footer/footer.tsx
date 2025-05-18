import styles from './footer.module.scss';
import Link from "next/link";


const footer = () => { 

    return (

        <>
            
            <footer className={styles.footer}>

                <div className={styles.footer__container}>

                    <div className={styles.footer__leftContainer}>

                        <ul className={styles.footer__list}>
                        <div className={styles.footer__listContainer}>
                        <label className={styles.footer__title} htmlFor="">Quick links</label>
                        <li className={styles.footer__listItem}>
                            <Link href="/">Home</Link>
                        </li>

                        <li className={styles.footer__listItem}>
                            <Link href="/">Activities</Link>
                        </li>

                        <li className={styles.footer__listItem}>
                            <Link href="/">Published</Link>
                        </li>

                        <li className={styles.footer__listItem}>
                            <Link href="/">Unpublished</Link>
                        </li>

                        <li className={styles.footer__listItem}>
                            <Link href="/">Drafts</Link>
                                </li>
                                </div>
                    </ul>

                    <ul className={styles.footer__list}>
                        <div className={styles.footer__listContainer}>
                        <label className={styles.footer__title} htmlFor="">Contact</label>
                        <li className={styles.footer__listItem}>
                           
                            info@doedeal.nl
                        </li>
                        {/* <ul className={`${styles.sidebar__navList} ${styles['sidebar__navList--second']}`}> */}

                        <li className={`${styles.footer__listItem} ${styles['footer__listItem--address']}`}>
                            <p>Demonstrator Lab</p>
                            <p>De Boelelaan 1085</p>
                            <p> VU Amsterdam</p>
                        </li>

                        </div>
                    </ul>

                        <ul className={styles.footer__list}>
                        <div className={styles.footer__listContainer}>
                        <label className={styles.footer__title} htmlFor="">Socials</label>
                        <li className={styles.footer__listItem}>
                            <Link href="https://www.instagram.com/doedeal_nl?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D"><i className="fa-brands fa-instagram"></i> doedeal_nl
                            </Link>
                        </li>
                        <li className={styles.footer__listItem}>
                            <Link href="https://www.linkedin.com/company/doedeal/"><i className="fa-brands fa-linkedin"></i> doedeal
                            </Link>
                        </li>
                        <li className={styles.footer__listItem}>
                            <Link href="https://www.facebook.com/people/DOEdeal/100088505853873/"><i className="fa-brands fa-facebook"></i> DOEdeal
                            </Link>
                        </li>

                                </div>
                    </ul>
                
                    </div>

                    <div className={styles.footer__rightContainer}>

                        <div className={styles.footer__rightContainer__logoContainer}>
                        <img className={styles.footer__rightContainer__logo} src="test complete logo.png" alt="Logo" />
                        </div>

                        <li className={styles.footer__listItem}>Unite, Explore & Connect</li>

                    </div>

                     

                    

                </div>


                <div className={styles.footer__copyright}>


                <h5>
        &copy; {new Date().getFullYear()} DOEdeal! - All Rights Reserved.
    </h5>

                </div>

            </footer>



        </>
    )

}
export default footer;