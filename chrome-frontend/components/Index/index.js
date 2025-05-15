// components/Index/index.js
import styles from '../../styles/Pages.module.css';

export default function Index({ navigateToPage }) {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>DEEPREAD</h1>
        <p className={styles.description}>
          Your AI-powered study assistant for PDFs. 
          Navigate to any PDF in Chrome and click this extension to open it in DeepRead.
        </p>
        <div className={styles.code}>
          <p>To use DeepRead:</p>
          <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
            <li>Open any PDF in Chrome</li>
            <li>Click the DeepRead extension icon</li>
            <li>or Click the "Open in DeepRead" button that appears</li>
          </ol>
        </div>
        <p onClick={() => navigateToPage('new')} style={{ cursor: 'pointer', marginTop: '20px' }}>{"Settings >"}</p>
      </main>
    </div>
  );
}