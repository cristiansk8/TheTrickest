import { NextResponse } from "next/server";
import prisma from '@/app/lib/prisma';

// 📌 Obtener WishSkate por email de usuario
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    console.log("🔍 Email recibido en la API:", email);

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 });
    }

    const wishSkate = await prisma.wishSkate.findUnique({
      where: { userId: email },
    });

    console.log("🛹 WishSkate encontrado:", wishSkate);

    if (!wishSkate) {
      return NextResponse.json(
        { exists: false, message: "WishSkate no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ exists: true, wishSkate }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// 📌 Actualizar WishSkate por email de usuario
export async function PUT(req: Request) {
  console.log("🔧 Actualizando WishSkate...");

  try {
    const data = await req.json();
    console.log("📦 Datos recibidos:", data);

    const { email, madero, trucks, ruedas, rodamientos, tenis } = data;

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    // Usar upsert para crear o actualizar WishSkate
    const updatedWishSkate = await prisma.wishSkate.upsert({
      where: { userId: email },
      update: {
        madero,
        trucks,
        ruedas,
        rodamientos,
        tenis,
      },
      create: {
        userId: email,
        madero,
        trucks,
        ruedas,
        rodamientos,
        tenis,
      },
    });

    return NextResponse.json(
      { message: "WishSkate actualizado con éxito", updatedWishSkate },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error al actualizar el WishSkate:", error);
    return NextResponse.json(
      { error: "Hubo un error en la actualización" },
      { status: 500 }
    );
  }
}
