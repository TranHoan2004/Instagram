import { Image } from '@heroui/react'
import React from 'react'
import { Outlet } from 'react-router'
import ThemeSwitcher from '~/components/layout/header/ThemeSwitcher'
import BrandLogo from '~/components/ui/BrandLogo'

const AuthLayout = () => {
  return (
    <div className="container mx-auto px-2 h-screen w-screen">
      <div className="flex w-full h-full">
        <div className="hidden lg:flex relative basis-1/2 items-center justify-center">
          <Image
            src="/auth-bg.webp"
            alt="illustration"
            className="h-full w-full object-cover"
            width={400}
            isBlurred
          />
        </div>
        <main className="relative flex-1 h-full flex flex-col justify-center items-center">
          <ThemeSwitcher className="absolute top-4 right-2" />
          <BrandLogo />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AuthLayout