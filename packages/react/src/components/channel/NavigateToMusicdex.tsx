import { Navigate, useParams } from "react-router-dom";

export function NavigateToMusicdex() {
  const { id } = useParams();
  const isStaging = location.origin.includes("staging");

  return (
    <Navigate
      to={
        isStaging
          ? `https://music-staging.holodex.net/channel/${id}`
          : `https://music.holodex.net/channel/${id}`
      }
			replace
    />
  );
}
