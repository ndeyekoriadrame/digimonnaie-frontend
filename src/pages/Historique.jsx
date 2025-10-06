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
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import API from "../api/axios"; // ton axios configuré

export default function Historique() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 5;

  // 🔹 Charger les transactions depuis l’API
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await API.get("/transactions");
      setTransactions(res.data.transactions || res.data);
    } catch (err) {
      console.error("Erreur lors du chargement de l'historique :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 🔹 Filtrage dynamique
  const filteredTransactions = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.transactionId?.toLowerCase().includes(term) ||
      t.type?.toLowerCase().includes(term) ||
      t.from?.fullname?.toLowerCase().includes(term) ||
      t.to?.fullname?.toLowerCase().includes(term) ||
      t.from?.email?.toLowerCase().includes(term) ||
      t.to?.email?.toLowerCase().includes(term)
    );
  });

  const pageCount = Math.ceil(filteredTransactions.length / rowsPerPage);
  const displayedTransactions = filteredTransactions.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleChangePage = (event, value) => setPage(value);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Historique des transactions
      </Typography>

      {/* Barre de recherche */}
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

      {/* Tableau des transactions */}
      <TableContainer component={Paper} sx={{ boxShadow: 4, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell align="center"><b>N° Transaction</b></TableCell>
              <TableCell align="center"><b>Expéditeur</b></TableCell>
              <TableCell align="center"><b>Destinataire</b></TableCell>
              <TableCell align="center"><b>Montant</b></TableCell>
              <TableCell align="center"><b>Date</b></TableCell>
              <TableCell align="center"><b>Status</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedTransactions.map((t, index) => (
              <TableRow key={t._id || index} hover>
                <TableCell align="center">{t.transactionId || "—"}</TableCell>
                <TableCell align="center">{t.from?.fullname || "—"}</TableCell>
                <TableCell align="center">{t.to?.fullname || "—"}</TableCell>
                <TableCell align="center">
                  {(t.amount || 0).toLocaleString()} CFA
                </TableCell>
                <TableCell align="center">
                  {new Date(t.createdAt).toLocaleString()}
                </TableCell>
                <TableCell align="center">
                  {t.status === "cancelled" ? "❌ Annulée" : "✅ Active"}
                </TableCell>
              </TableRow>
            ))}
            {displayedTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {loading ? "Chargement..." : "Aucune transaction trouvée."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={handleChangePage}
          color="primary"
        />
      </Box>
    </Box>
  );
}
