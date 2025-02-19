import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";
import axios from "axios";
import { useEffect } from "react";

export const Dashboard = ({ balance, setBalance }) => {
  
  // Fetch updated balance whenever Dashboard mounts
  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("http://localhost:5000/api/v1/account/balance", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBalance(res.data.balance); // ✅ Update balance
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };
    fetchBalance();
  }, [setBalance]); //Run only when setBalance changes
  return (
    <div>
      <Appbar />
      <div className="m-8">
        <Balance value={balance} /> {/* ✅ Balance updates dynamically */}
        <Users setBalance={setBalance} /> {/* ✅ If Users component modifies balance */}
      </div>
    </div>
  );
};
