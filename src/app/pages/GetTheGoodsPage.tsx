import { GetTheGoods } from "../components/GetTheGoods";
import { Footer } from "../components/Footer";

export function GetTheGoodsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <GetTheGoods />
      </div>
      <Footer />
    </div>
  );
}
