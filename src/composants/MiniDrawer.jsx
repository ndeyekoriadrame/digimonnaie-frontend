// composants/MiniDrawer.jsx
import * as React from "react";
import { styled, useTheme, createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Drawer as MuiFloatingDrawer } from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CancelIcon from "@mui/icons-material/Cancel";
import HistoryIcon from "@mui/icons-material/History";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";

import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import profileImage from "../assets/profile.jpg";
import Profile from "./Profile";
import API from "../api/axios";

// Styles Drawer
const drawerWidth = 240;
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});
const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: { width: `calc(${theme.spacing(8)} + 1px)` },
});
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));
const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  })
);
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && { ...openedMixin(theme), "& .MuiDrawer-paper": openedMixin(theme) }),
    ...(!open && { ...closedMixin(theme), "& .MuiDrawer-paper": closedMixin(theme) }),
  })
);

// ---------------------- MiniDrawer ----------------------
export default function MiniDrawer({ children }) {
  const themeMui = useTheme();
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElTheme, setAnchorElTheme] = React.useState(null);
  const [showProfile, setShowProfile] = React.useState(false);
  const [adminPhoto, setAdminPhoto] = React.useState(profileImage);
  const [themeMode, setThemeMode] = React.useState(() => {
    return localStorage.getItem("themeMode") || "system";
  });

  const userId = localStorage.getItem("userId");

  // Charger la photo de l'admin au montage
  React.useEffect(() => {
    const loadAdminPhoto = async () => {
      try {
        const res = await API.get(`auth/admin/${userId}`);
        if (res.data.photo) {
          const photoUrl = `${import.meta.env.VITE_API_URL || 'https://digimonnaie-backend-1.onrender.com'}${res.data.photo}`;
          setAdminPhoto(photoUrl);
        }
      } catch (err) {
        console.error("Erreur chargement photo:", err);
      }
    };
    if (userId) loadAdminPhoto();
  }, [userId]);

  // Déterminer le mode effectif (résoudre "system")
  const getEffectiveMode = React.useMemo(() => {
    if (themeMode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return themeMode;
  }, [themeMode]);

  // Créer le thème dynamique
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: getEffectiveMode,
          primary: { main: "#ff914d" },
        },
      }),
    [getEffectiveMode]
  );

  // Écouter les changements de préférence système
  React.useEffect(() => {
    if (themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setThemeMode("system"); // Force re-render
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleDrawerToggle = () => setOpen(!open);

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    localStorage.setItem("themeMode", mode);
  };

  const handlePhotoUpdate = (newPhotoUrl) => {
    setAdminPhoto(newPhotoUrl);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Utilisateur", icon: <PeopleIcon />, path: "/utilisateurs" },
    { text: "Dépôt", icon: <AccountBalanceIcon />, path: "/depot" },
    { text: "Annuler", icon: <CancelIcon />, path: "/annuler" },
    { text: "Historique", icon: <HistoryIcon />, path: "/historique" },
  ];

  const themeOptions = [
    { mode: "light", icon: <Brightness7Icon />, label: "Clair" },
    { mode: "dark", icon: <Brightness4Icon />, label: "Sombre" },
    { mode: "system", icon: <SettingsBrightnessIcon />, label: "Système" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                aria-label="toggle drawer"
                onClick={handleDrawerToggle}
                edge="start"
                sx={{ mr: 5 }}
              >
                <MenuIcon />
              </IconButton>
              <Link to="/dashboard">
                <img src={logo} alt="Logo" style={{ height: 80, cursor: "pointer" }} />
              </Link>
            </Box>

            <div>
              <IconButton
                size="large"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <img
                  src={adminPhoto}
                  alt="Profil"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    setShowProfile(true);
                    handleCloseMenu();
                  }}
                >
                  Profil
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
                      localStorage.removeItem("token");
                      localStorage.removeItem("userId");
                      window.location.href = "/login";
                    }
                  }}
                >
                  Déconnexion
                </MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" open={open}>
          <DrawerHeader />
          <Divider />
          <List>
            {menuItems.map(({ text, icon, path }) => (
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  component={Link}
                  to={path}
                  sx={{ minHeight: 80, justifyContent: open ? "initial" : "center", px: 2.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : "auto", justifyContent: "center" }}>
                    {icon}
                  </ListItemIcon>
                  <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider />

          {/* Bouton Thème avec Menu */}
          <List>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={(e) => setAnchorElTheme(e.currentTarget)}
                sx={{ minHeight: 80, justifyContent: open ? "initial" : "center", px: 2.5 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : "auto", justifyContent: "center" }}>
                  {themeMode === "light" && <Brightness7Icon />}
                  {themeMode === "dark" && <Brightness4Icon />}
                  {themeMode === "system" && <SettingsBrightnessIcon />}
                </ListItemIcon>
                <ListItemText primary="Thème" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          </List>

          {/* Menu contextuel pour les options de thème */}
          <Menu
            anchorEl={anchorElTheme}
            open={Boolean(anchorElTheme)}
            onClose={() => setAnchorElTheme(null)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            {themeOptions.map(({ mode, icon, label }) => (
              <MenuItem
                key={mode}
                selected={themeMode === mode}
                onClick={() => {
                  handleThemeChange(mode);
                  setAnchorElTheme(null);
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText>{label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          {children}
        </Box>

        <MuiFloatingDrawer anchor="right" open={showProfile} onClose={() => setShowProfile(false)}>
          <Profile 
            userId={userId} 
            onClose={() => setShowProfile(false)} 
            onPhotoUpdate={handlePhotoUpdate}
          />
        </MuiFloatingDrawer>
      </Box>
    </ThemeProvider>
  );
}