interface HeaderProps {
  onClick: () => void,
  id: string
}

export function Header({ onClick, id }: HeaderProps){
  return (
    <header id={id} className="border border-green flex">
      <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={onClick}><div className='i-heroicons:bars-3 rounded-md px-3 py-3 ' /></button>
      <div className='justify-start py-1 pl-3 text-xl'>HoloDex</div>
      <div className='i-heroicons:chevron-down py-5'/>
    </header>
  )
}