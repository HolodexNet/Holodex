import { ScrollArea } from '@radix-ui/themes'
import { layout } from './Frame.module.scss'
import { RouterProvider } from 'react-router-dom'
import router from '../../routes/router'

export function Frame() {
  return (
    <div className={layout}>
      <header ></header>
      <aside>Stuff</aside>
      <main>
        <ScrollArea type="always" scrollbars="vertical" style={{ height: '100%' }}>
          <RouterProvider router={router}></RouterProvider>
        </ScrollArea>
      </main>
    </div>
  )
}