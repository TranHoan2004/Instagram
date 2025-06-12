import { ApolloHydrationHelper } from '@apollo/client-integration-react-router'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { useNavigate, useHref } from 'react-router'

export function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  return (
    <ApolloHydrationHelper>
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        <ToastProvider
          placement="top-center"
          maxVisibleToasts={1}
          toastProps={{ radius: 'sm', timeout: 5000 }}
        />
        <NextThemeProvider attribute="class" defaultTheme="system">
          {children}
        </NextThemeProvider>
      </HeroUIProvider>
    </ApolloHydrationHelper>
  )
}
