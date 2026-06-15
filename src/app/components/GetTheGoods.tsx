import { Link } from "react-router-dom";
import titleImage from "figma:asset/928688118246c11022dd32ad61b41c1dc858b9d5.png";
import aiHandbookCover from "../../assets/AI-handbook-cover.png";
import { Navigation } from "./Navigation";

interface Product {
  slug: string;
  image: string;
  imageAlt: string;
  price: string;
  title: string;
  subtitle: string;
  description: string;
}

const products: Product[] = [
  {
    slug: "ai-workflows",
    image: aiHandbookCover,
    imageAlt: "New AI Workflows — A Creative Handbook for Designers",
    price: "$9.95 USD",
    title: "New AI Workflows",
    subtitle: "A Creative Handbook for Designers",
    description:
      "A handbook to help you get more creative control over your AI workflows. 63 pages, 6 cheat sheets, plus example prompts.",
  },
];

export function GetTheGoods() {
  return (
    <div className="min-h-screen">
      <Navigation variant="default" currentPage="get-the-goods" />

      <div className="bg-gradient-to-br from-[#5928CB] to-[#F65CE1] min-h-[calc(100vh-73px)]">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="mb-10 lg:mb-14">
            <img
              src={titleImage}
              alt="Get the Goods"
              className="w-[280px] sm:w-[360px] lg:w-[450px] h-auto"
            />
            <p className="mt-4 text-white/95 text-lg sm:text-xl max-w-2xl">
              Digital products to help you design smarter and faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product) => (
              <Link
                key={product.slug}
                to={`/get-the-goods/${product.slug}`}
                className="group relative block bg-white rounded-2xl overflow-hidden shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0px_20px_25px_0px_rgba(0,0,0,0.15),0px_8px_10px_0px_rgba(0,0,0,0.1)]"
              >
                <div className="relative bg-[#F5F5F7]">
                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    className="w-full aspect-[4/3] object-contain"
                  />
                  <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-[#5816dd] px-3 py-1 text-sm font-bold text-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.25)]">
                    {product.price}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="text-[#5816dd] text-[20px] font-bold leading-tight">
                    {product.title}
                  </h2>
                  <p className="mt-1 text-[15px] text-gray-700 font-medium">
                    {product.subtitle}
                  </p>
                  <p className="mt-3 text-[14px] text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
