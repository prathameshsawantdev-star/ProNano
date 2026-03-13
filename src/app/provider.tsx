"use client"

import { ThemeProvider } from "@/components/theme-provider";
import AuthLoadingView from "@/features/auth/components/auth-loading-view";
import UnauthenticatedView from "@/features/auth/components/unauthenticated-view";
import { ClerkProvider, SignInButton, SignOutButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { Authenticated, AuthLoading, ConvexReactClient, Unauthenticated } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const Provider = ({ children }: { children: React.ReactNode }) => {
    return(
        <ClerkProvider>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
               <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        >
         <Authenticated>
             {children}
         </Authenticated>
         <Unauthenticated>
           <UnauthenticatedView />
         </Unauthenticated>
         <AuthLoading>
            <AuthLoadingView />
         </AuthLoading>
        </ThemeProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}