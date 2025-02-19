import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin";
import { Dashboard } from "./pages/Dashboard";
import { SendMoney } from "./pages/SendMoney";
import axios from "axios";

function App() {
  const [balance, setBalance] = useState(10000); // ✅ Default balance

  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("http://localhost:5000/api/v1/account/balance", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBalance(res.data.balance); // ✅ Update balance from API
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };
    fetchBalance();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={localStorage.getItem("token") ? "/dashboard" : "/signup"} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<Dashboard balance={balance} setBalance={setBalance} />} />  {/* ✅ Fix: Pass setBalance */}
        <Route path="/send" element={<SendMoney balance={balance} setBalance={setBalance} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
