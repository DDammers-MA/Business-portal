import styles from './footer.module.scss';
import Link from 'next/link';

const footer = () => {
	return (
		<>
			<footer className={styles.footer}>
				<div className={styles.footer__container}>
					<div className={styles.footer__leftContainer}>
						<ul className={styles.footer__list}>
							<div className={styles.footer__listContainer}>
								<label className={styles.footer__title} htmlFor="">
									Quick links
								</label>
								<li className={styles.footer__listItem}>
									<Link href="/">Home</Link>
								</li>

								<li className={styles.footer__listItem}>
									<Link href="/activities">Activities</Link>
								</li>

								<li className={styles.footer__listItem}>
									<Link href="/events">Events</Link>
								</li>

								<li className={styles.footer__listItem}>
									<Link href="/?filter=published">Published</Link>
								</li>

								<li className={styles.footer__listItem}>
									<Link href="/?filter=drafts">Drafts</Link>
								</li>
							</div>
						</ul>

						<ul className={styles.footer__list}>
							<div className={styles.footer__listContainer}>
								<label className={styles.footer__title} htmlFor="">
									Contact
								</label>
								<li className={styles.footer__listItem}>
									<Link href="mailto:info@doedeal.nl">info@doedeal.nl</Link>
								</li>

								<li
									className={`${styles.footer__listItem} ${styles['footer__listItem--address']}`}
								>
									<Link
										href="https://www.google.com/maps/search/?api=1&query=De+Boelelaan+1085+Amsterdam"
										target="_blank"
									>
										<p>Demonstrator Lab</p>
										<p>De Boelelaan 1085</p>
										<p>VU Amsterdam</p>
									</Link>
								</li>
							</div>
						</ul>

						<ul className={styles.footer__list}>
							<div className={styles.footer__listContainer}>
								<label className={styles.footer__title} htmlFor="">
									Socials
								</label>
								<li className={styles.footer__listItem}>
									<Link
										href="https://www.instagram.com/doedeal_nl?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D"
										target="_blank"
									>
										<i className="fa-brands fa-instagram"></i> Instagram
									</Link>
								</li>
								<li className={styles.footer__listItem}>
									<Link
										href="https://www.linkedin.com/company/doedeal/"
										target="_blank"
									>
										<i className="fa-brands fa-linkedin"></i> LinkedIn
									</Link>
								</li>
								<li className={styles.footer__listItem}>
									<Link
										href="https://www.facebook.com/people/DOEdeal/100088505853873/"
										target="_blank"
									>
										<i className="fa-brands fa-facebook"></i> Facebook
									</Link>
								</li>
							</div>
						</ul>
					</div>

					<div className={styles.footer__rightContainer}>
						<div className={styles.footer__rightContainer__logoContainer}>
							<img
								className={styles.footer__rightContainer__logo}
								src="test complete logo.png"
								alt="Logo"
							/>
						</div>

						<li className={styles.footer__listItem}>
							Unite, Explore & Connect
						</li>
					</div>
				</div>

				<div className={styles.footer__copyright}>
					<h5>
						&copy; {new Date().getFullYear()} DOEdeal! - All Rights Reserved.
					</h5>
				</div>
			</footer>
		</>
	);
};
export default footer;
