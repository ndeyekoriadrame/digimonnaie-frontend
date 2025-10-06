import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Pagination,
  Button,
  Checkbox
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import ArchiveIcon from "@mui/icons-material/Archive";
import AddIcon from "@mui/icons-material/Add";

import AjouterUtilisateurPopup from "../composants/Popup";
import ModifierUtilisateurPopup from "../composants/ModifierUtilisateurPopup";
import API from "../api/axios";

export default function Utilisateurs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [openAddPopup, setOpenAddPopup] = useState(false);
  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const rowsPerPage = 5;

  // -------------------
  // Récupération utilisateurs backend
  // -------------------
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users", { params: { page: 1, limit: 100 } });
      const backendUsers = res.data.users.map(user => ({
        id: user._id,
        prenom: user.fullname?.split(" ")[0] || "",
        nom: user.fullname?.split(" ").slice(1).join(" ") || "",
        email: user.email,
        phone: user.phone,
        address: user.address,
        accountNumber: user.accountNumber,
        date: user.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        statut: user.blocked ? "Inactif" : "Actif",
        role: user.role,
      }));
      setUsers(backendUsers);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
    }
  };

  // -------------------
  // Filtrage et pagination
  // -------------------
  const filteredUsers = users.filter((user) =>
    (user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.date?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (user.statut?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const pageCount = Math.ceil(filteredUsers.length / rowsPerPage);
  const displayedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleChangePage = (event, value) => setPage(value);

  // -------------------
  // Ajouter un utilisateur
  // -------------------
  const handleAddUser = (newUserData) => {
    const today = new Date().toISOString().split("T")[0];
    const accountNumber = "DIGI-" + Math.floor(10000000 + Math.random() * 90000000);

    const nameParts = newUserData.fullname.trim().split(" ");
    const prenom = nameParts[0] || "";
    const nom = nameParts.slice(1).join(" ") || "";

    const newUser = {
      id: Date.now(),
      prenom,
      nom,
      email: newUserData.email || "",
      phone: newUserData.phone || "",
      address: newUserData.address || "",
      accountNumber,
      date: today,
      statut: "Actif",
      role: newUserData.role || "client",
    };

    setUsers(prev => [newUser, ...prev]);
  };

  // -------------------
  // Modifier
  // -------------------
  const handleEdit = (user) => {
    setUserToEdit(user);
    setOpenEditPopup(true);
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  // -------------------
  // Blocage / Déblocage
  // -------------------
  const handleToggleBlock = async (user) => {
    try {
      await API.post("/users/block", { ids: [user.id], block: user.statut === "Actif" });
      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, statut: user.statut === "Actif" ? "Inactif" : "Actif" } : u)
      );
    } catch (err) {
      console.error("Erreur blocage/déblocage:", err);
    }
  };

  // ✅ Blocage / Déblocage multiple avec un seul bouton
  const handleToggleBlockSelected = async () => {
    if (selectedUsers.length === 0) return;

    const allBlocked = users
      .filter(u => selectedUsers.includes(u.id))
      .every(u => u.statut === "Inactif");

    try {
      await API.post("/users/block", { ids: selectedUsers, block: !allBlocked });
      setUsers(prev =>
        prev.map(u =>
          selectedUsers.includes(u.id)
            ? { ...u, statut: allBlocked ? "Actif" : "Inactif" }
            : u
        )
      );
      setSelectedUsers([]);
    } catch (err) {
      console.error("Erreur blocage/déblocage multiple:", err);
    }
  };

  // -------------------
  // Suppression / Archivage
  // -------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      await API.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm("Voulez-vous vraiment supprimer les utilisateurs sélectionnés ?")) return;
    try {
      await Promise.all(selectedUsers.map(id => API.delete(`/users/${id}`)));
      setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
    } catch (err) {
      console.error("Erreur suppression multiple:", err);
    }
  };

  // -------------------
  // Sélection multiple
  // -------------------
  const handleSelectUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === displayedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(displayedUsers.map(u => u.id));
    }
  };

  // -------------------
  // Render
  // -------------------
  return (
    <Box sx={{ p: 3 }}>
      {/* Titre + bouton ajouter */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des utilisateurs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddPopup(true)}
        >
          Ajouter un utilisateur
        </Button>
      </Box>

      {/* Barre de recherche et actions multiples */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          fullWidth
          placeholder="Rechercher un utilisateur..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          variant="contained"
          onClick={handleToggleBlockSelected}
          disabled={selectedUsers.length === 0}
          sx={{
           backgroundColor: "#ff914d",
           "&:hover": { backgroundColor: "#ff7a26" }
          }}
        >
        Bloquer / Débloquer
        </Button>
        <Button
          variant="contained"
          onClick={handleDeleteSelected}
          disabled={selectedUsers.length === 0}
          sx={{
            backgroundColor: "#ff914d",
            "&:hover": { backgroundColor: "#ff7a26" }
          }}
        >
        Archiver
        </Button>
      </Box>

      {/* Tableau */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <Checkbox
                  checked={selectedUsers.length === displayedUsers.length && displayedUsers.length > 0}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell align="center"><b>Prénom</b></TableCell>
              <TableCell align="center"><b>Nom</b></TableCell>
              <TableCell align="center"><b>Email</b></TableCell>
              <TableCell align="center"><b>Téléphone</b></TableCell>
              <TableCell align="center"><b>Adresse</b></TableCell>
              <TableCell align="center"><b>N° de compte</b></TableCell>
              <TableCell align="center"><b>Date d'ajout</b></TableCell>
              <TableCell align="center"><b>Statut</b></TableCell>
              <TableCell align="center"><b>Rôle</b></TableCell>
              <TableCell align="center"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell align="center">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </TableCell>
                <TableCell align="center">{user.prenom}</TableCell>
                <TableCell align="center">{user.nom}</TableCell>
                <TableCell align="center">{user.email}</TableCell>
                <TableCell align="center">{user.phone}</TableCell>
                <TableCell align="center">{user.address}</TableCell>
                <TableCell align="center">{user.accountNumber}</TableCell>
                <TableCell align="center">{user.date}</TableCell>
                <TableCell
                  align="center"
                  sx={{ color: user.statut === "Actif" ? "green" : "red", fontWeight: "bold" }}
                >
                  {user.statut}
                </TableCell>
                <TableCell align="center">{user.role}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color={user.statut === "Actif" ? "error" : "success"}
                    onClick={() => handleToggleBlock(user)}
                  >
                    <BlockIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)}>
                    <ArchiveIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {displayedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination count={pageCount} page={page} onChange={handleChangePage} color="primary" />
      </Box>

      {/* Popups */}
      <AjouterUtilisateurPopup
        open={openAddPopup}
        onClose={() => setOpenAddPopup(false)}
        onAdd={handleAddUser}
      />
      <ModifierUtilisateurPopup
        open={openEditPopup}
        onClose={() => setOpenEditPopup(false)}
        onUpdate={handleUpdateUser}
        user={userToEdit}
      />
    </Box>
  );
}
