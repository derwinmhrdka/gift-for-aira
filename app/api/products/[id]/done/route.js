import { markWishlistProductDone } from "@/lib/airtable";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(_request, { params }) {
  const { id } = await params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  }

  try {
    const product = await markWishlistProductDone(id);
    revalidatePath("/");
    return NextResponse.json({ ok: true, product });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gagal memperbarui produk.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
