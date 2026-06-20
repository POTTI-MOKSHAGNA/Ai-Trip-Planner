import Navbar from "../../components/Navbar";
function Dashboard() {
    return(
        <div>
            <Navbar />
            <div>
                <div>
                    <h1>Travel Dashboard </h1>
                    <p> Plan new destinations and manage your tailored day-by-day itineraries. </p>
                </div>
                <div>
                    <button>Plan a New Trip</button>
                </div>
            </div>
        </div>
    )
}
export default Dashboard;