import { useEffect, useState } from "react";

const UsersList = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/user/bulk") // Adjust the API URL if needed
            .then(response => response.json())
            .then(data => setUsers(data.users))
            .catch(error => console.error("Error fetching users:", error));
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold">Users List</h2>
            <ul>
                {users.map(user => (
                    <li key={user._id} className="p-2 border-b">
                        <div className="font-semibold">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.username}</div>
                        <div className="font-bold text-green-600">Balance: Rs {user.balance.toFixed(2)}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UsersList;  