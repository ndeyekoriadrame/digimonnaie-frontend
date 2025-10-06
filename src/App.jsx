import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MiniDrawer from "./composants/MiniDrawer";
import Dashboard from "./pages/Dashboard";
import Utilisateurs from "./pages/Utilisateurs";
import Depot from "./pages/Depot";
import Annuler from "./pages/Annuler";
import Historique from "./pages/Historique";
import DashboardAgent from "./pages/Dashboard";
import Login from "./pages/Login";
import PrivateRoute from "./composants/PrivateRoute";
import AutoLogout from "./composants/AutoLogout"; // 👉 Import du composant
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      {/* AutoLogout surveille toute l’appli */}
      <AutoLogout timeout={120000} /> {/* 2 min d’inactivité */}
      
      <Routes>
        {/* Page publique */}
        <Route path="/login" element={<Login />} />

        {/* Routes protégées */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <MiniDrawer>
              <DashboardAgent />
            </MiniDrawer>
          </PrivateRoute>
        } />

        <Route path="/utilisateurs" element={
          <PrivateRoute>
            <MiniDrawer>
              <Utilisateurs />
            </MiniDrawer>
          </PrivateRoute>
        } />

        <Route path="/depot" element={
          <PrivateRoute>
            <MiniDrawer>
              <Depot />
            </MiniDrawer>
          </PrivateRoute>
        } />

        <Route path="/historique" element={
          <PrivateRoute>
            <MiniDrawer>
              <Historique />
            </MiniDrawer>
          </PrivateRoute>
        } />

        <Route path="/annuler" element={
          <PrivateRoute>
            <MiniDrawer>
              <Annuler />
            </MiniDrawer>
          </PrivateRoute>
        } />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
