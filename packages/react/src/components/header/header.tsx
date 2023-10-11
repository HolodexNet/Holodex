import { darkAtom } from "@/hooks/useTheme";
import { Button } from "@/shadcn/ui/button";
import { userAtom } from "@/store/auth";
import { useAtom, useAtomValue } from "jotai";

interface HeaderProps {
  onClick: () => void;
  id: string;
}

export function Header({ onClick, id }: HeaderProps) {
  const [dark, toggle] = useAtom(darkAtom);
  const user = useAtomValue(userAtom);

  return (
    <header
      id={id}
      className="bg-base-2 flex items-center px-8 py-auto gap-4 sticky top-0 z-40"
    >
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded"
        onClick={onClick}
      >
        <div className="i-heroicons:bars-3 rounded-md px-3 py-3 " />
      </button>
      <div className="justify-start py-1 pl-3 text-xl">Hololive</div>
      <div className="i-heroicons:chevron-down py-5" />
      <div className="flex flex-grow" />
      <Button
        size='icon-lg'
        variant='ghost'
        className="p-2"
        onClick={() => toggle(!dark)}
      >
        <div className="i-heroicons:sun-20-solid h-full text-4xl" />
      </Button>
      {user ? (
        <img
          className="w-auto h-full p-2 rounded-full"
          src={`https://avatars.dicebear.com/api/jdenticon/${user.id}.svg`}
        />
      ) : (
        <button>Login</button>
      )}
    </header>
  );
}
