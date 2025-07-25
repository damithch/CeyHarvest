import { Link } from 'react-router-dom';

const Navbar=()=>(
    <nav style={{ background: '#228B22', padding: '1rem', color: 'white' }}>
        <h2 style={{ display: 'inline' }}>CeyHarvest</h2>
        <div style={{ float: 'right' }}>
            <Link to="/marketplace" style={{ color: 'white', marginRight: '15px' }}>Marketplace</Link>
            <Link to="/login" style={{ color: 'white', marginRight: '15px' }}>Login</Link>
            <Link to="/register" style={{ color: 'white' }}>Register</Link>
        </div>
    </nav>
);

export default Navbar;