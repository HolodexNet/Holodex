import { MUSICDEX_URL } from "@/lib/consts";
import { Navigate, useParams } from "react-router-dom";

export function NavigateToMusicdex() {
  const { id } = useParams();

  return <Navigate to={`${MUSICDEX_URL}/channel/${id}`} replace />;
}
