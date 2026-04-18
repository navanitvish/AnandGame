const dummyBookings = [
  {
    _id: "BK001",
    userId: { name: "Rahul Sharma", phone: "9876543210" },
    venueId: { name: "City Sports Arena" },
    sportId: { name: "Cricket" },
    groundId: { name: "Ground A" },
    bookingType: "Team",
    bookingDate: "2026-04-20",
    timeSlot: "6AM - 8AM",
    amount: 2000,
    paymentStatus: "Paid",
    status: "Pending",
    createdAt: new Date()
  },
  {
    _id: "BK002",
    userId: { name: "Amit Verma", phone: "9123456780" },
    venueId: { name: "Elite Turf" },
    sportId: { name: "Football" },
    groundId: { name: "Turf 1" },
    bookingType: "Team",
    bookingDate: "2026-04-18",
    timeSlot: "7PM - 9PM",
    amount: 1500,
    paymentStatus: "Paid",
    status: "Verified",
    createdAt: new Date()
  },
  {
    _id: "BK003",
    userId: { name: "Priya Singh", phone: "9988776655" },
    venueId: { name: "Green Valley" },
    sportId: { name: "Badminton" },
    groundId: { name: "Court 2" },
    bookingType: "Individual",
    bookingDate: "2026-04-22",
    timeSlot: "5PM - 6PM",
    amount: 500,
    paymentStatus: "Pending",
    status: "Pending",
    createdAt: new Date()
  }
]

export default dummyBookings;