import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export const SendMoney = ({ balance, setBalance }) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const [amount, setAmount] = useState("");

  const handleTransfer = async () => {
    if (amount <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    if (amount > balance) {
      alert("Insufficient balance!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/v1/account/transfer",
        { to: id, amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.message === "Transfer successful") {
        setBalance((prevBalance) => prevBalance - Number(amount)); // ✅ Deduct balance dynamically
        alert("Money sent successfully!");
        setAmount(""); // ✅ Reset amount input
      }
    } catch (error) {
      console.error("Error sending money:", error);
      alert("Transaction failed! Please try again.");
    }
  };

  return (
    <div className="flex justify-center h-screen bg-gray-100">
      <div className="h-full flex flex-col justify-center">
        <div className="border h-min text-card-foreground max-w-md p-4 space-y-8 w-96 bg-white shadow-lg rounded-lg">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-3xl font-bold text-center">Send Money</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-2xl text-white">{name[0].toUpperCase()}</span>
              </div>
              <h3 className="text-2xl font-semibold">{name}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">Your Balance: ₹{balance}</p> {/* ✅ Show updated balance */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="amount">
                  Amount (in ₹)
                </label>
                <input
                  onChange={(e) => setAmount(e.target.value)}
                  value={amount}
                  type="number"
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                  id="amount"
                  placeholder="Enter amount"
                  min="1"
                />
              </div>
              <button
                onClick={handleTransfer}
                className="h-10 px-4 py-2 w-full bg-green-500 text-white rounded-md"
                disabled={!amount || amount <= 0 || amount > balance} // ✅ Disable button for invalid inputs
              >
                Initiate Transfer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
