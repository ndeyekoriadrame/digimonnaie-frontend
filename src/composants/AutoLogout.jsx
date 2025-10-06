import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AutoLogout({ timeout = 120000 }) { // 2 min par défaut
  const navigate = useNavigate();

  useEffect(() => {
    let logoutTimer;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        // Supprime le token
        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        // Redirection vers login
        alert("Vous avez été déconnecté pour inactivité.");
        navigate("/login");
      }, timeout);
    };

    // Écoute des événements utilisateur
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Lancer le timer au montage
    resetTimer();

    // Nettoyage
    return () => {
      clearTimeout(logoutTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate, timeout]);

  return null; // Ce composant ne rend rien
}
