import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Log de variables de entorno críticas al inicializar (solo en producción)
console.log('🔧 [AUTH CONFIG] INICIANDO - ENV:', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
  console.log('🔧 [AUTH CONFIG] Variables de entorno en producción:');
  console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ NO CONFIGURADO'}`);
  console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Lazy load dependencies
        const prisma = (await import('@/app/lib/prisma')).default;
        const bcrypt = await import('bcryptjs');

        console.log('🔐 [AUTH] Inicio de autenticación con credenciales');

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH] Error: Email o contraseña faltantes');
          throw new Error('Email y contraseña son requeridos');
        }

        console.log(`🔍 [AUTH] Buscando usuario: ${credentials.email}`);

        // Buscar usuario en la BD
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log(`❌ [AUTH] Error: Usuario no encontrado - ${credentials.email}`);
          throw new Error('Credenciales inválidas');
        }

        if (!user.password) {
          console.log(`❌ [AUTH] Error: Usuario sin contraseña configurada - ${credentials.email}`);
          throw new Error('Credenciales inválidas');
        }

        console.log(`✅ [AUTH] Usuario encontrado: ${user.email} (ID: ${user.id}, Role: ${user.role})`);
        console.log(`🔑 [AUTH] Hash de contraseña: ${user.password.substring(0, 20)}...`);

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          console.log(`❌ [AUTH] Error: Contraseña inválida para ${credentials.email}`);
          throw new Error('Credenciales inválidas');
        }

        console.log(`✅ [AUTH] Contraseña válida para ${credentials.email}`);
        console.log(`✅ [AUTH] Autenticación exitosa - Usuario: ${user.email}, Role: ${user.role}`);

        // Retornar usuario para la sesión
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.photo,
        };
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Auto-crear usuario en BD cuando hace login con Google
      if (account?.provider === 'google' && user.email) {
        try {
          // Lazy load prisma
          const prisma = (await import('@/app/lib/prisma')).default;

          // Verificar si el usuario ya existe
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // Si no existe, crearlo con datos de Google (sin contraseña aún)
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || '',
                photo: user.image || '',
                profileStatus: 'basic', // Solo tiene datos de Google
                password: null, // Sin contraseña todavía
                createdAt: new Date(),
              },
            });
            console.log(`✅ Usuario creado automáticamente: ${user.email}`);
          }
          // Si existe pero no tiene contraseña, el modal se mostrará en el cliente
        } catch (error) {
          console.error('❌ Error creando usuario automáticamente:', error);
          // Permitir el login aunque falle la creación en BD
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        console.log(`🎫 [JWT] Token creado para usuario: ${user.email}`);
      }

      // Obtener profileStatus, hasPassword y role de la BD
      if (token.email) {
        try {
          // Lazy load prisma
          const prisma = (await import('@/app/lib/prisma')).default;

           const dbUser = await prisma.user.findUnique({
             where: { email: token.email as string },
             select: {
               profileStatus: true,
               password: true,
               role: true,
               username: true,
             },
           });

           if (!dbUser) {
             console.log(`⚠️ [JWT] Usuario no encontrado en BD: ${token.email}`);
           } else {
             console.log(`✅ [JWT] Datos del usuario obtenidos - Role: ${dbUser.role}, Status: ${dbUser.profileStatus}`);
           }

           token.profileStatus = dbUser?.profileStatus || 'basic';
           token.hasPassword = !!dbUser?.password; // true si tiene contraseña
           token.role = dbUser?.role || 'skater';
            token.username = dbUser?.username || undefined;
        } catch (error) {
          console.error('❌ [JWT] Error obteniendo datos del usuario:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.profileStatus = token.profileStatus as string;
        session.user.hasPassword = token.hasPassword as boolean;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        console.log(`📝 [SESSION] Sesión creada para: ${session.user.email} (Role: ${session.user.role})`);
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  debug: process.env.NODE_ENV === 'development',
};
