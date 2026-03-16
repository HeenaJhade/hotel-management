import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api";
import {
Users,
Mail,
Phone,
CheckCircle,
Ban,
Trash2,
Search,
} from "lucide-react";


const ITEMS_PER_PAGE = 10;

const GuestManagement = () => {

const [guests, setGuests] = useState([]);

const [pagination, setPagination] = useState({
currentPage: 1,
totalPages: 1,
totalItems: 0,
limit: ITEMS_PER_PAGE,
hasNext: false,
hasPrev: false,
});

const [searchTerm, setSearchTerm] = useState("");
const [loading, setLoading] = useState(true);
const [currentPage, setCurrentPage] = useState(1);

useEffect(() => {
fetchGuests();
}, [currentPage, searchTerm]);

const fetchGuests = async () => {
try {

setLoading(true);

const params = {
page: currentPage,
limit: ITEMS_PER_PAGE,
...(searchTerm.trim() && { search: searchTerm.trim() }),
};

const response = await apiClient.get("/staff/guest", { params });

const { data, pagination: pag } = response.data;

setGuests(data || []);

setPagination({
currentPage: pag.currentPage,
totalPages: pag.totalPages,
totalItems: pag.totalItems,
limit: pag.limit,
hasNext: pag.hasNext,
hasPrev: pag.hasPrev,
});

setLoading(false);

} catch (error) {
console.error("Error fetching guests:", error);
setGuests([]);
setLoading(false);
}
};

const handleStatusToggle = async (guestId, isBlocked) => {
try {

await apiClient.patch(`/staff/guest/${guestId}/block`, {
isBlocked: !isBlocked,
});

fetchGuests();

} catch (error) {
console.error("Error updating guest status:", error);
}
};

const handleDelete = async (guestId) => {

if (!window.confirm("Are you sure you want to delete this guest?\nThis action cannot be undone.")) {
return;
}

try {

await apiClient.delete(`/staff/guest/${guestId}`);
fetchGuests();

} catch (error) {
console.error("Error deleting guest:", error);
}

};

const handleSearchChange = (e) => {
setSearchTerm(e.target.value);
setCurrentPage(1);
};

if (loading) {
return (
<div className="flex items-center justify-center min-h-[60vh]">
<div className="text-lg text-slate-500 animate-pulse flex items-center gap-3">
<Users className="w-6 h-6 animate-spin" />
Loading guests...
</div>
</div>
);
}

return (

<div className="space-y-8">

{/* Header + Search */}

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

<div>
<h1 className="text-3xl font-bold text-slate-900">Guest Management</h1>
<p className="mt-1 text-slate-500">Manage and monitor all registered guests</p>
</div>

<div className="relative w-full md:w-80">

<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

<input
type="text"
placeholder="Search by name, email or phone..."
value={searchTerm}
onChange={handleSearchChange}
className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-[#C6A87C] focus:border-[#C6A87C] focus:outline-none transition"
/>

</div>

</div>

{/* Table */}

<div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

<div className="overflow-x-auto">

<table className="w-full">

<thead className="bg-slate-50 border-b border-slate-200">

<tr>
<th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Name</th>
<th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Email</th>
<th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Phone</th>
<th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Verified</th>
<th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Total Bookings</th>
<th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Actions</th>
</tr>

</thead>

<tbody className="divide-y divide-slate-100">

{guests.length === 0 ? (

<tr>

<td colSpan={6} className="px-6 py-20 text-center text-slate-400">
<Users className="mx-auto mb-3 w-8 h-8 opacity-40" />
No guests found
</td>

</tr>

) : (

guests.map((guest) => (

<tr key={guest._id} className="hover:bg-slate-50 transition duration-200">

<td className="px-6 py-4 font-medium text-slate-900">
{guest.name || "—"}
</td>

<td className="px-6 py-4 text-slate-600">

<div className="flex items-center gap-2">
<Mail className="w-4 h-4 text-slate-400" />
{guest.email || "—"}
</div>

</td>

<td className="px-6 py-4 text-slate-600">

<div className="flex items-center gap-2">
<Phone className="w-4 h-4 text-slate-400" />
{guest.phone || "—"}
</div>

</td>

<td className="px-6 py-4">

<span
className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
guest.isVerified
? "bg-emerald-100 text-emerald-700 border-emerald-200"
: "bg-slate-100 text-slate-600 border-slate-200"
}`}
>

{guest.isVerified ? "Verified" : "Not Verified"}

</span>

</td>

<td className="px-6 py-4 font-semibold text-slate-800">
{guest.totalBookings ?? 0}
</td>

<td className="px-6 py-4">

<div className="flex items-center gap-2">

<button
onClick={() => handleStatusToggle(guest._id, guest.isBlocked)}
className={`px-3 py-2 text-sm rounded-lg flex items-center ${
guest.isBlocked
? "bg-[#C6A87C] hover:bg-[#B09265] text-white"
: "bg-red-600 hover:bg-red-700 text-white"
}`}
>

{guest.isBlocked ? (
<>
<CheckCircle className="w-4 h-4 mr-1" />
Unblock
</>
) : (
<>
<Ban className="w-4 h-4 mr-1" />
Block
</>
)}

</button>

<button
onClick={() => handleDelete(guest._id)}
className="px-3 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center"
>

<Trash2 className="w-4 h-4" />

</button>

</div>

</td>

</tr>

))

)}

</tbody>

</table>

</div>

{/* Pagination */}

<div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t gap-4">

<p className="text-sm text-slate-600">
Showing {guests.length} of {pagination.totalItems} guests
{" • "} Page {pagination.currentPage} of {pagination.totalPages}
</p>

<div className="flex gap-2">

<button
disabled={!pagination.hasPrev || loading}
onClick={() => setCurrentPage((p) => p - 1)}
className="px-3 py-2 text-sm border rounded-md hover:bg-slate-100 disabled:opacity-50"
>
Previous
</button>

<button
disabled={!pagination.hasNext || loading}
onClick={() => setCurrentPage((p) => p + 1)}
className="px-3 py-2 text-sm border rounded-md hover:bg-slate-100 disabled:opacity-50"
>
Next
</button>

</div>

</div>

</div>

</div>

);
};

export default GuestManagement;