import DonutIcon from '../assets/Snacks/Donut';
import CupcakeIcon from '../assets/Snacks/Cupcake';
import IceCreamIcon from '../assets/Snacks/IceCream';
import CoffeeIcon from '../assets/Snacks/Coffee';
import SodaIcon from '../assets/Snacks/SodaCup';
import FriesIcon from '../assets/Snacks/FrenchFries';
import CookieIcon from '../assets/Snacks/Cookies';
import PizzaIcon from '../assets/Snacks/Pizza';

export default function FloatingFoodBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* single layer, deduplicated */}
      <div className="absolute left-[10%] top-[20%]" style={{ animation: 'float 6s ease-in-out infinite' }}>
        <DonutIcon width={40} height={40} />
      </div>
      <div className="absolute left-[80%] top-[10%]" style={{ animation: 'float 7s ease-in-out 1s infinite' }}>
        <CupcakeIcon width={35} height={35} />
      </div>
      <div className="absolute left-[5%] top-[15%]" style={{ animation: 'float 6s ease-in-out 0.3s infinite' }}>
        <IceCreamIcon width={40} height={40} />
      </div>
      <div className="absolute left-[75%] top-[30%]" style={{ animation: 'float 4s ease-in-out 1s infinite' }}>
        <CoffeeIcon width={35} height={35} />
      </div>
      <div className="absolute left-[20%] top-[80%]" style={{ animation: 'float 8s ease-in-out 0.5s infinite' }}>
        <SodaIcon width={38} height={38} />
      </div>
      <div className="absolute left-[70%] top-[75%]" style={{ animation: 'float 6.5s ease-in-out 1.5s infinite' }}>
        <FriesIcon width={42} height={42} />
      </div>
      <div className="absolute left-[50%] top-[88%]" style={{ animation: 'float 3.5s ease-in-out 1.5s infinite' }}>
        <PizzaIcon width={42} height={42} />
      </div>
      <div className="absolute left-[45%] top-[5%]" style={{ animation: 'float 7.5s ease-in-out 0.8s infinite' }}>
        <CookieIcon width={36} height={36} />
      </div>
    </div>
  );
}
