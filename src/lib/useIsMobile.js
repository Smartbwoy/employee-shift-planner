import { useEffect, useState } from "react";

export default function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia?.("(max-width: 700px)").matches ?? false);
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return mobile;
}
