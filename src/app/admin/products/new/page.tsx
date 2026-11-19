import { PageHeader } from "@/components/admin/ui";
import { EMPTY_DRAFT, ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader
        title="Add product"
        description="A name and one priced option is enough to start. Everything else can wait."
        back={{ label: "Products", href: "/admin/products" }}
      />

      <ProductForm initial={EMPTY_DRAFT} mode="new" />
    </>
  );
}
