import React, {useContext} from 'react';
import './App.scss';
import styles from './styles/app.module.scss';
import PlanillasApp from './components/PlanillasSwiper';
import Header from './common/Header';
import Auth from './components/Auth';
import UserContext from './context/userContext.jsx';
import { HashRouter } from 'react-router-dom';
function App() {
const { user, loading } = useContext(UserContext);
  return (
    <HashRouter>
      <div className={styles.app}>
        <Header/>
        <main className={styles.main}>
          {loading ? (
            <div className={styles.loading} role="status">Cargando PayDesk…</div>
          ) : !user ? <Auth/> : <PlanillasApp/>}
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
