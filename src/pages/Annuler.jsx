import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import API from "../api/axios"; // ton instance axios avec baseURL + headers

// 🔹 Définition du thème principal
const theme = createTheme({
  palette: {
    primary: {
      main: "#ff914d", // couleur principale
    },
  },
});

export default function Annuler() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [motif, setMotif] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 5;

  // 🔹 Charger les transactions depuis l’API
  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data.transactions); // ✅ correction
    } catch (err) {
      console.error("Erreur lors du chargement des transactions", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleChangePage = (event, value) => setPage(value);

  const handleOpenDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setMotif("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransaction(null);
  };

  // 🔹 Annuler une transaction
  const handleAnnuler = async () => {
    if (!selectedTransaction) return;

    try {
      setLoading(true);
      const res = await API.post("/transactions/cancel", {
        transactionId: selectedTransaction.transactionId,
        motif,
      });

      alert(res.data.message);

      // 🔹 Recharge la liste depuis l’API
      await fetchTransactions();

      handleCloseDialog();
    } catch (err) {
      console.error("Erreur annulation", err);
      alert(err.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Filtrage par nom ou ID
  const filteredTransactions = transactions.filter(
    (t) =>
      t.to?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.transactionId.toString().includes(searchTerm)
  );

  const pageCount = Math.ceil(filteredTransactions.length / rowsPerPage);
  const displayedTransactions = filteredTransactions.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Annulation de transactions
        </Typography>

        {/* 🔹 Barre de recherche */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Rechercher une transaction..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* 🔹 Tableau des transactions */}
        <TableContainer component={Paper} sx={{ boxShadow: 4, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell align="center"><b>N° Transaction</b></TableCell>
                <TableCell align="center"><b>Type</b></TableCell>
                <TableCell align="center"><b>Client</b></TableCell>
                <TableCell align="center"><b>Montant</b></TableCell>
                <TableCell align="center"><b>Date</b></TableCell>
                <TableCell align="center"><b>Status</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedTransactions.map((t) => (
                <TableRow key={t.transactionId} hover>
                  <TableCell align="center">{t.transactionId}</TableCell>
                  <TableCell align="center">{t.type || "—"}</TableCell>
                  <TableCell align="center">{t.to?.fullname || "—"}</TableCell>
                  <TableCell align="center">{(t.amount || 0).toLocaleString()} CFA</TableCell>
                  <TableCell align="center">
                    {new Date(t.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    {t.status === "cancelled" ? "❌ Annulée" : "✅ Active"}
                  </TableCell>
                  <TableCell align="center">
                    {t.status !== "cancelled" && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CancelIcon />}
                        onClick={() => handleOpenDialog(t)}
                      >
                        Annuler
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {displayedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucune transaction trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 🔹 Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination count={pageCount} page={page} onChange={handleChangePage} color="primary" />
        </Box>

        {/* 🔹 Dialog pour annuler la transaction */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
          <DialogTitle>Annuler la transaction</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Transaction N°{selectedTransaction?.transactionId} - {selectedTransaction?.to?.fullname}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Motif d'annulation"
              fullWidth
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Fermer
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAnnuler}
              disabled={loading}
            >
              {loading ? "Annulation..." : "Confirmer"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
