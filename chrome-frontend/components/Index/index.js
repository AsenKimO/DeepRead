// components/Index/index.js
import styles from '../../styles/Pages.module.css';

export default function Index({ navigateToPage }) {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>DEEPREAD</h1>
        <p className={styles.description}>
          Your AI-powered study assistant for PDFs. To use DeepRead:
        </p>
        <div className={styles.description}>
          <p></p>
          <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
            <li>Open any PDF in Chrome</li>
            <li>Click the "Open in DeepRead" button that appears</li>
          </ol>
        </div>
      </main>
    </div>
  );
}