import { proxyWithPersist } from "@/valtio-persist/index";
import { useEffect } from "react";
import { useSnapshot } from "valtio/react";

export const cssVariablesStore = proxyWithPersist('page-theme', {

  '--background': '0 0% 100%',
  '--foreground': '222.2 84% 4.9%',
  '--primary': '111.2 47.4% 11.2%',
  '--primary-foreground': '210 40% 98%',
  '--secondary': '210 40% 96.1%',
  '--secondary-foreground': '222.2 47.4% 11.2%',
  '--muted': '210 40% 96.1%',
  '--muted-foreground': '215.4 16.3% 46.9%',
  '--accent': '210 40% 96.1%',
  '--accent-foreground': '222.2 47.4% 11.2%',
  '--destructive': '0 84.2% 60.2%',
  '--destructive-foreground': '210 40% 98%',
  '--border': '214.3 31.8% 91.4%',
  '--input': '214.3 31.8% 91.4%',
  '--ring': '222.2 84% 4.9%',

}, ['--background', '--foreground', '--primary', '--primary-foreground', '--secondary', '--muted', '--accent', '--destructive', '--border', '--input', '--ring']);


export function useThemeInit() {
  const snap = useSnapshot(cssVariablesStore);

  useEffect(() => {
    const setCssVariable = (property: string, value: string) => {
      document.documentElement.style.setProperty(property, value);
    };

    setCssVariable('--background', snap['--background']);
    setCssVariable('--foreground', snap['--foreground']);
    setCssVariable('--primary', snap['--primary']);
    setCssVariable('--primary-foreground', snap['--primary-foreground']);
    setCssVariable('--secondary', snap['--secondary']);
    setCssVariable('--secondary-foreground', snap['--secondary-foreground']);
    setCssVariable('--muted', snap['--muted']);
    setCssVariable('--muted-foreground', snap['--muted-foreground']);
    setCssVariable('--accent', snap['--accent']);
    setCssVariable('--accent-foreground', snap['--accent-foreground']);
    setCssVariable('--destructive', snap['--destructive']);
    setCssVariable('--destructive-foreground', snap['--destructive-foreground']);
    setCssVariable('--border', snap['--border']);
    setCssVariable('--input', snap['--input']);
    setCssVariable('--ring', snap['--ring']);
  }, [snap]); // This effect runs whenever the snapshot (and thus the state) changes

  return null; // This component doesn't need to render anything visible
};