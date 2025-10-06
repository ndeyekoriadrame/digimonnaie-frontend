import React, { useState, useEffect } from "react";
import { Typography, TextField, Button, Paper } from "@mui/material";
import API from "../api/axios";

export default function Depot() {
  const [accountNumber, setAccountNumber] = useState("");
  const [montant, setMontant] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminBalance, setAdminBalance] = useState(0);

  // -------- Récupérer le solde admin ----------
  useEffect(() => {
    const fetchAdminBalance = async () => {
      try {
        const res = await API.get("/auth/me"); // Endpoint pour récupérer admin connecté
        setAdminBalance(res.data.balance || 0);
      } catch (err) {
        console.error("Erreur récupération solde admin", err);
      }
    };
    fetchAdminBalance();
  }, []);

  const handleSubmit = async () => {
    if (!accountNumber || !montant || Number(montant) <= 0) {
      alert("Veuillez remplir correctement tous les champs !");
      return;
    }

    if (Number(montant) > adminBalance) {
      alert(`Solde admin insuffisant ! Solde actuel : ${adminBalance} CFA`);
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/transactions/deposit", {
        accountNumber,
        amount: Number(montant)
      });

      alert(`${response.data.message}\nMontant déposé: ${montant} CFA`);

      // Reset
      setAccountNumber("");
      setMontant("");

      // Mettre à jour le solde admin après dépôt
      setAdminBalance((prev) => prev - Number(montant));

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 450, margin: "auto", mt: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
        Effectuer un dépôt
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Solde admin actuel : <strong>{adminBalance} CFA</strong>
      </Typography>

      <TextField
        fullWidth
        label="Numéro de compte"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        label="Montant à déposer (CFA)"
        type="number"
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        color="warning"
        fullWidth
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Traitement..." : "Valider"}
      </Button>
    </Paper>
  );
}
