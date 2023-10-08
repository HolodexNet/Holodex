import './Frame.scss'
import { RouterProvider } from 'react-router-dom'
import router from '@/routes/router'
import { ReactPropTypes, useEffect } from 'react'
import classNames from 'classnames'
import { Sidebar } from '../sidebar/sidebar'
import { isFloatingAtom, isMobileAtom, onResizeAtom, sidebarOpenAtom, sidebarShouldBeFullscreenAtom, toggleAtom } from '@/hooks/useFrame'
import { useAtom } from 'jotai/react'
import { darkAtom } from '@/hooks/useTheme'

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

  const mainClasses = classNames({
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
      <aside className="">
        <Sidebar id="sidebar" />
      </aside>
      <header className="">Header
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={() => toggle()}>Toggle Sidebar</button>
      </header>
      <main className="">
        <RouterProvider router={router}></RouterProvider>
      </main>
      {isMobile && <footer className="">Footer</footer>}
    </div>
  )
}