import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, createTheme, ThemeProvider } from "@mui/material";
import API from "../api/axios";

// Thème principal
const theme = createTheme({
  palette: {
    primary: {
      main: "#ff914d",
    },
  },
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("https://digimonnaie-backend-1.onrender.com/api/auth/login", { email, password });
      const { token, user } = res.data;

      // Stocker le token et info utilisateur dans localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id); // ✅ Fix important pour MiniDrawer
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur serveur");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 400, mx: "auto", mt: 2, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Connexion
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" mt={1}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
            Se connecter
          </Button>
        </form>
      </Box>
    </ThemeProvider>
  );
}
