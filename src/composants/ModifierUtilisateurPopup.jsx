import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import API from "../api/axios";

export default function ModifierUtilisateurPopup({ open, onClose, user, onUpdate }) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (user) {
      setFullname(`${user.prenom} ${user.nom}`);
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setRole(user.role || "client");
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      fullname,
      email,
      phone,
      address,
      role,
    };

    try {
      await API.put(`/users/${user.id}`, updatedUser); // mettre à jour backend
      onUpdate({
        ...updatedUser,
        prenom: fullname.split(" ")[0] || "",
        nom: fullname.split(" ").slice(1).join(" ") || "",
      }); // mettre à jour frontend
      onClose();
    } catch (err) {
      console.error("Erreur mise à jour utilisateur:", err);
      alert("Impossible de modifier l'utilisateur !");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Modifier l'utilisateur</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        <TextField sx={{mt: 4 }} label="Nom complet" value={fullname} onChange={(e) => setFullname(e.target.value)} />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField label="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} />
        <TextField label="Rôle" value={role} onChange={(e) => setRole(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Modifier</Button>
      </DialogActions>
    </Dialog>
  );
}
