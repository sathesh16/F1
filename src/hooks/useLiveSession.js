import { useEffect, useState } from "react";

export default function useLiveSession() {

  const [session, setSession] = useState(null);

  useEffect(() => {

    let interval;

    async function loadSession() {

      try {

        const res = await fetch(
          "http://127.0.0.1:8000/api/session/live"
        );

        const data = await res.json();

        setSession(data);

      } catch (error) {

        console.error(
          "Live session error",
          error
        );

      }

    }

    loadSession();

    interval = setInterval(
      loadSession,
      200
    );

    return () => {

      clearInterval(interval);

    };

  }, []);

  return {
    session,
  };

}