import './Frame.scss'
import { RouterProvider } from 'react-router-dom'
import router from '@/routes/router'
import { ReactPropTypes, useEffect } from 'react'
import classNames from 'classnames'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { isFloatingAtom, isMobileAtom, onResizeAtom, sidebarOpenAtom, sidebarShouldBeFullscreenAtom, toggleAtom } from '@/hooks/useFrame'
import { useAtom } from 'jotai/react'
import { darkAtom } from '@/hooks/useTheme'
import { Header } from "@/components/header/header"
import { Toaster } from '@/shadcn/ui/toaster'
import clsx from 'clsx'

export function Frame() {

  const [, toggle] = useAtom(toggleAtom)
  const [, resize] = useAtom(onResizeAtom)
  const [dark] = useAtom(darkAtom);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize)
  }, []);


  const [floating] = useAtom(isFloatingAtom)
  const [open] = useAtom(sidebarOpenAtom)
  const [isMobile] = useAtom(isMobileAtom)
  const [fs] = useAtom(sidebarShouldBeFullscreenAtom)
  console.log(fs)

  const mainClasses = clsx({
    'mobile-footer': isMobile,
    'sidebar-static': !floating,
    'sidebar-floating': floating,
    'sidebar-open': open,
    'sidebar-closed': !open,
    'sidebar-fullscreen': fs,
    'dark': dark,
  })

  return (
    <div className={mainClasses} id='layout'>
      <aside className="border-r border-r-base">
        <Sidebar id="sidebar" />
      </aside>
      <Header onClick={toggle} id='header' />
      <main className="">
        <RouterProvider router={router}></RouterProvider>
      </main>
      {isMobile && <footer className="">Footer</footer>}
      <Toaster />
    </div>
  )
}