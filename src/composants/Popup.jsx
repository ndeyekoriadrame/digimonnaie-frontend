import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Stepper,
  Step,
  StepLabel,
  ThemeProvider,
  createTheme,
  Alert,
} from "@mui/material";
import API from "../api/axios";

const theme = createTheme({
  palette: { primary: { main: "#ff914d" } },
});

export default function AjouterUtilisateurPopup({ open, onClose, onAdd }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullname: "",
    dob: "",
    idCard: "",
    phone: "",
    address: "",
    email: "",
    role: "client",
    password: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [dobError, setDobError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [idCardError, setIdCardError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const steps = ["Informations personnelles", "Coordonnées", "Rôle & Mot de passe"];

  const handleNext = () => {
    if (!dobError && !emailError && !phoneError && !idCardError && !passwordError) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation date de naissance
    if (name === "dob") {
      const today = new Date().toISOString().split("T")[0];
      if (value > today) setDobError("❌ La date de naissance ne peut pas être dans le futur.");
      else setDobError("");
    }

    // Validation email
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailRegex.test(value) ? "" : "❌ Email invalide");
    }

    // Validation téléphone (ex : 8 à 15 chiffres)
    if (name === "phone") {
      const phoneRegex = /^[0-9]{8,15}$/;
      setPhoneError(phoneRegex.test(value) ? "" : "❌ Numéro de téléphone invalide");
    }

    // Validation carte d'identité (alphanumérique 5-20 caractères)
    if (name === "idCard") {
      const idRegex = /^[a-zA-Z0-9]{5,20}$/;
      setIdCardError(idRegex.test(value) ? "" : "❌ N° carte d'identité invalide");
    }

    // Validation mot de passe (min 6 caractères)
    if (name === "password") {
      setPasswordError(value.length >= 6 ? "" : "❌ Mot de passe trop court (min 6 caractères)");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Vérifier les erreurs avant envoi
    if (dobError || emailError || phoneError || idCardError || passwordError) {
      setErrorMsg("❌ Veuillez corriger les erreurs avant de continuer.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });

      const res = await API.post("/users", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg(`✅ ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} créé avec succès !`);
      onAdd(res.data.user);

      // Reset
      setFormData({
        fullname: "",
        dob: "",
        idCard: "",
        phone: "",
        address: "",
        email: "",
        role: "client",
        password: "",
        file: null,
      });
      setCurrentStep(0);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Créer un compte</DialogTitle>
        <DialogContent>
          <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
          {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

          <form onSubmit={handleSubmit}>
            {currentStep === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField label="Nom complet" name="fullname" value={formData.fullname} onChange={handleChange} fullWidth required />
                <TextField
                  label="Date de naissance"
                  name="dob"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split("T")[0] }}
                  value={formData.dob}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!dobError}
                  helperText={dobError}
                />
                <TextField
                  label="N° Carte d'identité"
                  name="idCard"
                  value={formData.idCard}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!idCardError}
                  helperText={idCardError}
                />
                <Button variant="outlined" component="label">
                  Télécharger un fichier
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
                {formData.file && <span>📎 {formData.file.name}</span>}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="contained" color="primary" onClick={handleNext} disabled={!!dobError || !!idCardError}>Suivant</Button>
                </Box>
              </Box>
            )}

            {currentStep === 1 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!phoneError}
                  helperText={phoneError}
                />
                <TextField
                  label="Adresse"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!emailError}
                  helperText={emailError}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button variant="outlined" color="primary" onClick={handleBack}>Précédent</Button>
                  <Button variant="contained" color="primary" onClick={handleNext} disabled={!!emailError || !!phoneError}>Suivant</Button>
                </Box>
              </Box>
            )}

            {currentStep === 2 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!passwordError}
                  helperText={passwordError}
                />
                <FormControl>
                  <RadioGroup name="role" value={formData.role} onChange={handleChange} row>
                    <FormControlLabel value="client" control={<Radio color="primary" />} label="Client" />
                    <FormControlLabel value="distributeur" control={<Radio color="primary" />} label="Distributeur" />
                  </RadioGroup>
                </FormControl>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button variant="outlined" color="primary" onClick={handleBack}>Précédent</Button>
                  <Button variant="contained" color="primary" type="submit" disabled={loading || !!passwordError}>
                    {loading ? "Création..." : "Créer Compte"}
                  </Button>
                </Box>
              </Box>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
