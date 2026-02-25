import { Product } from "@/types";
import Image from "next/image";
import LoadingLink from "@/components/LoadingLink/LoadingLink";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div key={product.ORACLE_ID} className="cardItem position-relative">
      <div
        className="card h-100 align-items-center"
        style={{ minHeight: "20vh" }}
      >
        <div className="imageContainer">
          <Image
            src={product.IMAGE_URL}
            className="productImage"
            alt={product.PRODUCT_ID}
            width={100}
            height={100}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <div className="card-body text-center p-0 w-100">
          <h2 className="h5 card-title py-2">{product.BRAND}</h2>
          <p className="card-text pb-4">{product.PRODUCT_ID}</p>
          <LoadingLink
            href={`/products/${product.BRAND}/${product.ORACLE_ID}`}
            className="btn btn-primary w-100 position-absolute bottom-0 start-0 mt-2 cardSpecText"
          >
            詳細規格
          </LoadingLink>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
