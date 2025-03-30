import './FoodWastageStats.css';

const FoodWastageStats = () => {
  return (
    <section className="stats-section">
      <div className="container">
        <h2 className="stats-title">Food Wastage in India</h2>
        <p className="stats-description">
          Millions of tons of edible food are thrown away each year while millions struggle with hunger.
          Together, we can make a difference.
        </p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">68.7</div>
            <div className="stat-label">MILLION TONS</div>
            <p className="stat-description">of food wasted annually in India</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">40%</div>
            <div className="stat-label">OF FOOD PRODUCED</div>
            <p className="stat-description">is wasted before it reaches consumers</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">194</div>
            <div className="stat-label">MILLION PEOPLE</div>
            <p className="stat-description">are undernourished in India</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">₹92,000</div>
            <div className="stat-label">CRORES</div>
            <p className="stat-description">economic value of food wasted annually</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodWastageStats; 