// composants/Profile.jsx
import * as React from "react";
import { Box, Typography, TextField, Button, Avatar } from "@mui/material";
import API from "../api/axios";

export default function Profile({ userId, onClose, onPhotoUpdate }) {
  const [admin, setAdmin] = React.useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    photo: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [file, setFile] = React.useState(null);

  React.useEffect(() => {
    if (!userId) return;

    const fetchAdmin = async () => {
      try {
        const res = await API.get(`auth/admin/${userId}`);
        setAdmin(res.data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, [userId]);

  const handleChange = (e) =>
    setAdmin({ ...admin, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Prévisualisation locale
      setAdmin({ ...admin, photo: URL.createObjectURL(e.target.files[0]) });
    }
  };
const handleSave = async () => {
  try {
    const formData = new FormData();
    formData.append("nom", admin.nom);
    formData.append("prenom", admin.prenom);
    formData.append("adresse", admin.adresse);
    formData.append("telephone", admin.telephone);
    if (file) formData.append("photo", file);

    const res = await API.put(`/auth/update/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Mettre à jour la photo dans le MiniDrawer
    if (res.data.admin.photo && onPhotoUpdate) {
      const photoUrl = `${import.meta.env.VITE_API_URL || 'https://digimonnaie-backend-1.onrender.com'}${res.data.admin.photo}`;
      onPhotoUpdate(photoUrl);
    }

    alert("✅ Profil mis à jour !");
    onClose();
    
    // Recharger la page après 500ms
    setTimeout(() => {
      window.location.reload();
    }, 500);
    
  } catch (err) {
    console.error(err);
    alert("❌ Impossible de mettre à jour le profil");
  }
};
  // Construire l'URL complète pour l'avatar
  const avatarUrl = admin.photo 
    ? (admin.photo.startsWith('blob:') 
        ? admin.photo 
        : `${import.meta.env.VITE_API_URL || 'https://digimonnaie-backend-1.onrender.com'}${admin.photo}`)
    : "/assets/profile.jpg";

  return (
    <Box sx={{ p: 3, width: 300, mt: 10 }}>
      <Typography variant="h6" gutterBottom>
        Profil
      </Typography>

      {/* Avatar / photo de profil */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Avatar
          src={avatarUrl}
          sx={{ width: 80, height: 80 }}
        />
      </Box>

      {/* Upload de photo */}
      <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
        Changer la photo
        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
      </Button>

      {["nom", "prenom", "email", "telephone", "adresse"].map((field) => (
        <TextField
          key={field}
          name={field}
          label={field.charAt(0).toUpperCase() + field.slice(1)}
          value={admin[field] || ""}
          onChange={handleChange}
          disabled={field === "email"}
          fullWidth
          sx={{ my: 1 }}
        />
      ))}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ mt: 2 }}
      >
        Enregistrer
      </Button>
    </Box>
  );
}