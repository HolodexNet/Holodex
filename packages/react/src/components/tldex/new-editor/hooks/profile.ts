// exports TLDex behaviors as hooks
import { atom, useAtom, useAtomValue } from "jotai";

// Atom for the list of profiles
const profilesAtom = atom([
  {
    name: "Default",
    prefix: "",
    suffix: "",
  },
]);

// Atom for the active profile index
const activeProfileIdxAtom = atom(0);

// Computed atom for the active profile
const activeProfileAtom = atom(
  (get) => get(profilesAtom)[get(activeProfileIdxAtom)],
);

export function useProfiles() {
  const [profiles, setProfiles] = useAtom(profilesAtom);
  const [activeProfileIdx, setActiveProfileIdx] = useAtom(activeProfileIdxAtom);

  const addProfile = (name: string) =>
    setProfiles([...profiles, { name, prefix: "", suffix: "" }]);

  const deleteProfile = (id: number) => {
    if (profiles.length === 1) return; // Prevent deleting the last profile
    const updatedProfiles = profiles.filter((_, index) => index !== id);
    setProfiles(updatedProfiles);
    if (activeProfileIdx >= updatedProfiles.length) {
      setActiveProfileIdx(updatedProfiles.length - 1);
    }
  };

  const nextProfile = () =>
    setActiveProfileIdx((idx) => (idx + 1) % profiles.length);

  const prevProfile = () =>
    setActiveProfileIdx((idx) => (idx - 1 + profiles.length) % profiles.length);

  const goToProfile = (id: number) =>
    setActiveProfileIdx(id < profiles.length ? id : profiles.length - 1);

  return {
    profiles,
    addProfile,
    deleteProfile,
    nextProfile,
    prevProfile,
    goToProfile,
  };
}

// Hook to use active profile
export function useActiveProfile() {
  const activeProfile = useAtomValue(activeProfileAtom);
  return activeProfile;
}

// Hooks for shifting the active profile up or down
export function useShiftProfile() {
  const [profiles, setProfiles] = useAtom(profilesAtom);
  const [activeProfileIdx, setActiveProfileIdx] = useAtom(activeProfileIdxAtom);

  const shiftActiveProfileUp = () => {
    if (activeProfileIdx > 0) {
      const updatedProfiles = [...profiles];
      [
        updatedProfiles[activeProfileIdx - 1],
        updatedProfiles[activeProfileIdx],
      ] = [
        updatedProfiles[activeProfileIdx],
        updatedProfiles[activeProfileIdx - 1],
      ];
      setProfiles(updatedProfiles);
      setActiveProfileIdx(activeProfileIdx - 1);
    }
  };

  const shiftActiveProfileDown = () => {
    if (activeProfileIdx < profiles.length - 1) {
      const updatedProfiles = [...profiles];
      [
        updatedProfiles[activeProfileIdx + 1],
        updatedProfiles[activeProfileIdx],
      ] = [
        updatedProfiles[activeProfileIdx],
        updatedProfiles[activeProfileIdx + 1],
      ];
      setProfiles(updatedProfiles);
      setActiveProfileIdx(activeProfileIdx + 1);
    }
  };

  return { shiftActiveProfileUp, shiftActiveProfileDown };
}
