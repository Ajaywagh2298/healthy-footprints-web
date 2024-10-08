import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoginScreen from './Screens/LoginScreen';
import DashboardScreen from './Screens/DashboardScreen';
import CreatePatientScreen from './Screens/CreatePatientScreen';
import DailyRecordScreen from './Screens/DailyRecordScreen';
import RemindersScreen from './Screens/RemindersScreen';
import StockScreen from './Screens/StockScreen';
import { BACKEND_HOST_URL ,FRONTEND_HOST_URL} from './config/config';
import axios from 'axios';
import './App.css';
import MedicinePlanScreen from './Screens/MedicinePlanScreen';
import DietPlanScreen from './Screens/DietPlanScreen';
import ItemsScreen from './Screens/ItemsScreen';
import InventoryScreen from './Screens/InventoryScreen';
import ReminderProcessor from './Processor/ReminderProcessor';
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* <ReminderProcessor/> */}
      <Router>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
          <Route path="/createPatient" element={<CreatePatientScreen />} />
          <Route path="/dailyRecord" element={<DailyRecordScreen />} />
          <Route path='/reminder' element={<RemindersScreen />} />
          <Route path='/medicine' element={<MedicinePlanScreen />} />
          <Route path='/deit-plan' element={<DietPlanScreen />} />
          <Route path='/item' element={<ItemsScreen />} />
          <Route path='/stock' element={<StockScreen />} />
          <Route path='/inventory' element={ <InventoryScreen/>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  let user = JSON.parse(localStorage.getItem('user'));

  user = user.user;
  React.useEffect(() => {
    const checkAuth = async () => {
      if (user && user.token && user.uid) {
        try {
          const response = await axios.get(`${BACKEND_HOST_URL}/api/auth/authUser/${user.uid}`, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': FRONTEND_HOST_URL
            },
            withCredentials: true, // This includes cookies in the request if your backend expects them
          });
          
          const dataArray = response.data;
          const isValidUser = dataArray.some(obj => obj.token === user.token && obj.logout === 1);
          
          if (!isValidUser) {
            navigate('/', { replace: true });
          }
        } catch (error) {
          navigate('/', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    };

    checkAuth();
  }, [navigate, user]);

  return children;
}

export default App;
