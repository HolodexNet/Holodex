import './Frame.scss'
import { RouterProvider } from 'react-router-dom'
import router from '../../routes/router'
import { useSnapshot } from 'valtio'
import { useEffect } from 'react'
import classNames from 'classnames'
import { Sidebar } from '../sidebar/sidebar'
import { isFloatingAtom, isMobileAtom, onResizeAtom, sidebarOpenAtom, sidebarShouldBeFullscreenAtom, toggleAtom } from './useFrame'
import { useAtom } from 'jotai/react'

export function Frame() {

  const [, toggle] = useAtom(toggleAtom)
  const [, resize] = useAtom(onResizeAtom)

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
  })

  return (
    <div className={mainClasses} id='layout'>
      <aside className="border border-red">
        <Sidebar id="sidebar" />
      </aside>
      <header className="border border-green">Header
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={() => toggle()}>Toggle Sidebar</button>
      </header>
      <main className="border border-green">
        <RouterProvider router={router}></RouterProvider>
      </main>
      {isMobile && <footer className="border border-purple">Footer</footer>}
    </div>
  )
}