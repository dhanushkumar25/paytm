import { useEffect, useState } from "react";
import { Button } from "./Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/v1/user/bulk?filter=${filter}`);
                setUsers(response.data.users);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [filter]);

    return (
        <>
            <div className="font-bold mt-6 text-lg">Users</div>
            <div className="my-2">
                <input
                    onChange={(e) => setFilter(e.target.value)}
                    type="text"
                    placeholder="Search users..."
                    className="w-full px-2 py-1 border rounded border-slate-200"
                />
            </div>
            <div className="space-y-3">
                {users.map((user) => (
                    <User key={user._id} user={user} />
                ))}
            </div>
        </>
    );
};

function User({ user }) {
    const navigate = useNavigate();

    return (
        <div className="flex justify-between items-center p-3 border-b border-gray-300">
            {/* ✅ User Info */}
            <div className="flex items-center">
                <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center items-center text-xl font-semibold mr-3">
                    {user.firstName[0]}
                </div>
                <div className="flex flex-col">
                    <div className="font-medium">
                        {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                        Balance: ₹{user.balance ? user.balance.toFixed(2) : "0.00"} {/* ✅ Prevents crash */}
                    </div>
                </div>
            </div>

            {/* ✅ Smaller, Right-Aligned Button */}
            <Button
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => navigate(`/send?id=${user._id}&name=${user.firstName}`)}
                label="Send Money"
            />
        </div>
    );
}
